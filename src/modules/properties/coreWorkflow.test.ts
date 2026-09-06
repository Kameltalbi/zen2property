import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../../app';
import { pool } from '../../db/pool';

const EMAIL_A = 'p0-workflow-a@rentelyo.test';
const EMAIL_B = 'p0-workflow-b@rentelyo.test';
const PASSWORD = 'P0-workflow-pass!';

type Json = Record<string, unknown>;

function sessionCookie(res: Response): string {
  const parts = res.headers.getSetCookie();
  const session = parts.find((part) => part.startsWith('rentelyo_session='));
  assert.ok(session, 'register/login must set rentelyo_session');
  return session.split(';')[0];
}

function monthRange(day = new Date()) {
  const y = day.getFullYear();
  const m = String(day.getMonth() + 1).padStart(2, '0');
  const start = `${y}-${m}-01`;
  const last = new Date(y, day.getMonth() + 1, 0).getDate();
  const end = `${y}-${m}-${String(last).padStart(2, '0')}`;
  return { start, end, due: start };
}

async function cleanupTestUsers(): Promise<void> {
  const like = 'p0-workflow-%@rentelyo.test';
  const tables = [
    'receipts',
    'generated_documents',
    'documents',
    'notifications',
    'audit_logs',
    'rent_increases',
    'expenses',
    'maintenance_requests',
    'payments',
    'leases',
    'tenants',
    'properties',
    'users',
  ];
  for (const table of tables) {
    await pool.query(
      `DELETE FROM ${table} WHERE ${table === 'users' ? 'email LIKE $1' : 'user_id IN (SELECT id FROM users WHERE email LIKE $1)'}`,
      [like],
    );
  }
}

async function request(
  base: string,
  path: string,
  init: RequestInit & { cookie?: string } = {},
): Promise<{ status: number; body: Json; res: Response; cookie: string }> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json');
  if (init.cookie) headers.set('cookie', init.cookie);
  const res = await fetch(`${base}${path}`, { ...init, headers });
  const text = await res.text();
  let body: Json = {};
  if (text) {
    try {
      body = JSON.parse(text) as Json;
    } catch {
      body = { raw: text };
    }
  }
  return { status: res.status, body, res, cookie: sessionCookieSafe(res) };
}

function sessionCookieSafe(res: Response): string {
  try {
    return sessionCookie(res);
  } catch {
    return '';
  }
}

async function json<T>(
  base: string,
  path: string,
  init: RequestInit & { cookie?: string } = {},
): Promise<T> {
  const result = await request(base, path, init);
  assert.ok(result.status >= 200 && result.status < 300, `${path} -> ${result.status} ${JSON.stringify(result.body)}`);
  return result.body as T;
}

async function main() {
  await cleanupTestUsers();
  const app = createApp();
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Failed to bind test server');
  const base = `http://127.0.0.1:${address.port}/api/v1`;
  const dates = monthRange();

  try {
    const registeredA = await request(base, '/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: EMAIL_A,
        password: PASSWORD,
        fullName: 'P0 Landlord A',
        countryCode: 'GB',
      }),
    });
    assert.equal(registeredA.status, 201);
    const cookieA = registeredA.cookie;

    const registeredB = await request(base, '/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: EMAIL_B,
        password: PASSWORD,
        fullName: 'P0 Landlord B',
        countryCode: 'GB',
      }),
    });
    assert.equal(registeredB.status, 201);
    const cookieB = registeredB.cookie;

    const empty = await json<{ properties: unknown[] }>(base, '/properties', { cookie: cookieA });
    assert.equal(empty.properties.length, 0, 'new account must start with zero properties');

    const created = await json<{ property: { id: string; name: string; city: string | null } }>(base, '/properties', {
      method: 'POST',
      cookie: cookieA,
      body: JSON.stringify({
        name: 'P0 Test Flat',
        address: '10 Test Street',
        city: 'Manchester',
        postalCode: 'M1 1AA',
        countryCode: 'GB',
        type: 'APARTMENT',
        monthlyRent: 950,
        monthlyCharges: 50,
        currency: 'GBP',
        surface: 42,
      }),
    });
    assert.equal(created.property.name, 'P0 Test Flat');
    let propertyId = created.property.id;

    const limited = await request(base, '/properties', {
      method: 'POST',
      cookie: cookieA,
      body: JSON.stringify({
        name: 'Second property',
        address: '11 Test Street',
        city: 'Manchester',
        countryCode: 'GB',
        type: 'HOUSE',
      }),
    });
    assert.equal(limited.status, 402, 'free plan must block a second property');

    const isolatedList = await json<{ properties: Array<{ id: string }> }>(base, '/properties', { cookie: cookieB });
    assert.equal(isolatedList.properties.length, 0);
    const isolatedGet = await request(base, `/properties/${propertyId}`, { cookie: cookieB });
    assert.equal(isolatedGet.status, 404);

    const patched = await json<{ property: { name: string; city: string | null } }>(base, `/properties/${propertyId}`, {
      method: 'PATCH',
      cookie: cookieA,
      body: JSON.stringify({ name: 'P0 Test Flat edited', city: 'Leeds' }),
    });
    assert.equal(patched.property.name, 'P0 Test Flat edited');
    assert.equal(patched.property.city, 'Leeds');

    const deletedEmpty = await request(base, `/properties/${propertyId}`, { method: 'DELETE', cookie: cookieA });
    assert.equal(deletedEmpty.status, 204);

    const recreated = await json<{ property: { id: string } }>(base, '/properties', {
      method: 'POST',
      cookie: cookieA,
      body: JSON.stringify({
        name: 'P0 Workflow House',
        address: '12 Test Street',
        city: 'Bristol',
        countryCode: 'GB',
        type: 'HOUSE',
        monthlyRent: 1200,
        monthlyCharges: 0,
        currency: 'GBP',
      }),
    });
    propertyId = recreated.property.id;

    const tenant = await json<{ tenant: { id: string } }>(base, '/tenants', {
      method: 'POST',
      cookie: cookieA,
      body: JSON.stringify({
        propertyId,
        firstName: 'Ada',
        lastName: 'Tenant',
        email: 'p0-tenant@rentelyo.test',
        moveInDate: dates.start,
        deposit: 1200,
      }),
    });
    const blockedDelete = await request(base, `/properties/${propertyId}`, { method: 'DELETE', cookie: cookieA });
    assert.equal(blockedDelete.status, 409);

    const lease = await json<{ lease: { id: string } }>(base, '/leases', {
      method: 'POST',
      cookie: cookieA,
      body: JSON.stringify({
        propertyId,
        tenantId: tenant.tenant.id,
        label: 'Ada — Bristol 2026',
        status: 'active',
        leaseType: 'unfurnished',
        startDate: dates.start,
        monthlyRent: 1200,
        monthlyCharges: 0,
        currency: 'GBP',
        deposit: 1200,
        paymentDay: 1,
      }),
    });
    assert.ok(lease.lease.id);

    const listed = await json<{ payments: Array<{ id: string; status: string; amount: number }> }>(base, '/payments', {
      cookie: cookieA,
    });
    const payment = listed.payments.find((row) => row.status === 'PENDING' || row.status === 'LATE');
    assert.ok(payment, 'active lease must create an expected rent period');
    assert.equal(payment.amount, 1200);

    const beforePaid = await json<{
      totalProperties: number;
      occupiedUnits: number;
      vacantUnits: number;
      collectedThisMonth: number;
      expectedThisMonth: number;
      pendingCount: number;
    }>(base, '/dashboard', { cookie: cookieA });
    assert.equal(beforePaid.totalProperties, 1);
    assert.equal(beforePaid.occupiedUnits, 1);
    assert.equal(beforePaid.vacantUnits, 0);
    assert.equal(beforePaid.collectedThisMonth, 0);
    assert.equal(beforePaid.expectedThisMonth, 1200);
    assert.ok(beforePaid.pendingCount >= 1);

    const paid = await json<{ payment: { status: string } }>(base, `/payments/${payment.id}/mark-paid`, {
      method: 'POST',
      cookie: cookieA,
      body: JSON.stringify({ method: 'BANK_TRANSFER' }),
    });
    assert.equal(paid.payment.status, 'PAID');

    const afterPaid = await json<{ collectedThisMonth: number; pendingCount: number }>(base, '/dashboard', {
      cookie: cookieA,
    });
    assert.equal(afterPaid.collectedThisMonth, 1200);

    const receipt = await json<{ receipt: { id: string; number: string } }>(
      base,
      `/payments/${payment.id}/receipt`,
      { method: 'POST', cookie: cookieA },
    );
    assert.ok(receipt.receipt.number);

    const pdf = await fetch(`${base}/receipts/${receipt.receipt.id}/pdf`, {
      headers: { cookie: cookieA },
    });
    assert.equal(pdf.status, 200);
    assert.match(pdf.headers.get('content-type') ?? '', /pdf/i);
    const bytes = Buffer.from(await pdf.arrayBuffer());
    assert.ok(bytes.length > 100, 'PDF receipt must not be empty');
    assert.equal(bytes.subarray(0, 4).toString(), '%PDF');

    const logout = await request(base, '/auth/logout', { method: 'POST', cookie: cookieA });
    assert.equal(logout.status, 204);
    const unauth = await request(base, '/properties');
    assert.equal(unauth.status, 401);

    const login = await request(base, '/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: EMAIL_A, password: PASSWORD }),
    });
    assert.equal(login.status, 200);
    const persisted = await json<{ properties: Array<{ id: string; name: string }> }>(base, '/properties', {
      cookie: login.cookie,
    });
    assert.equal(persisted.properties.length, 1);
    assert.equal(persisted.properties[0].id, propertyId);
    assert.equal(persisted.properties[0].name, 'P0 Workflow House');

    console.log('P0 core workflow tests passed');
  } finally {
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
    await cleanupTestUsers();
    await pool.end();
  }
}

void main().catch((err) => {
  console.error(err);
  void pool.end().finally(() => process.exit(1));
});

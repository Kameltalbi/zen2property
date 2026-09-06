import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../../app';
import { pool } from '../../db/pool';

const EMAIL_A = 'p0-maint-a@rentelyo.test';
const EMAIL_B = 'p0-maint-b@rentelyo.test';
const PASSWORD = 'P0-maint-pass!';

type Json = Record<string, unknown>;

function sessionCookie(res: Response): string {
  const parts = res.headers.getSetCookie();
  const session = parts.find((part) => part.startsWith('rentelyo_session='));
  assert.ok(session, 'register/login must set rentelyo_session');
  return session.split(';')[0];
}

async function cleanupTestUsers(): Promise<void> {
  const like = 'p0-maint-%@rentelyo.test';
  for (const table of ['expenses', 'maintenance_requests', 'tenants', 'properties', 'users']) {
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
): Promise<{ status: number; body: Json; cookie: string }> {
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
  let cookie = '';
  try {
    cookie = sessionCookie(res);
  } catch {
    cookie = '';
  }
  return { status: res.status, body, cookie };
}

async function json<T>(base: string, path: string, init: RequestInit & { cookie?: string } = {}): Promise<T> {
  const result = await request(base, path, init);
  assert.ok(result.status >= 200 && result.status < 300, `${path} -> ${result.status} ${JSON.stringify(result.body)}`);
  return result.body as T;
}

async function register(base: string, email: string, name: string) {
  const result = await request(base, '/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password: PASSWORD, fullName: name, countryCode: 'GB' }),
  });
  assert.equal(result.status, 201, `register ${email} -> ${result.status}`);
  return result.cookie;
}

async function createProperty(base: string, cookie: string, name: string) {
  const created = await json<{ property: { id: string; currency: string } }>(base, '/properties', {
    method: 'POST',
    cookie,
    body: JSON.stringify({
      name,
      address: '10 Test Street',
      city: 'Bristol',
      countryCode: 'GB',
      type: 'APARTMENT',
      monthlyRent: 900,
      currency: 'GBP',
    }),
  });
  return created.property;
}

async function main() {
  await cleanupTestUsers();
  const app = createApp();
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Failed to bind test server');
  const base = `http://127.0.0.1:${address.port}/api/v1`;

  try {
    const cookieA = await register(base, EMAIL_A, 'Maint Landlord A');
    const cookieB = await register(base, EMAIL_B, 'Maint Landlord B');
    const propertyA = await createProperty(base, cookieA, 'A House');
    const propertyB = await createProperty(base, cookieB, 'B House');

    const empty = await json<{ maintenance: unknown[] }>(base, '/operations/maintenance', { cookie: cookieA });
    assert.equal(empty.maintenance.length, 0);

    const stolenProperty = await request(base, '/operations/maintenance', {
      method: 'POST',
      cookie: cookieA,
      body: JSON.stringify({ propertyId: propertyB.id, title: 'Should fail' }),
    });
    assert.equal(stolenProperty.status, 404);

    const created = await json<{ maintenance: { id: string; status: string; priority: string; title: string } }>(
      base,
      '/operations/maintenance',
      {
        method: 'POST',
        cookie: cookieA,
        body: JSON.stringify({
          propertyId: propertyA.id,
          title: 'Kitchen leak',
          description: 'Slow drip under sink',
          category: 'PLUMBING',
          priority: 'HIGH',
          status: 'NEW',
        }),
      },
    );
    assert.equal(created.maintenance.title, 'Kitchen leak');
    assert.equal(created.maintenance.status, 'NEW');
    const jobId = created.maintenance.id;

    const listB = await json<{ maintenance: unknown[] }>(base, '/operations/maintenance', { cookie: cookieB });
    assert.equal(listB.maintenance.length, 0);
    const patchB = await request(base, `/operations/maintenance/${jobId}`, {
      method: 'PATCH',
      cookie: cookieB,
      body: JSON.stringify({ title: 'Hacked' }),
    });
    assert.equal(patchB.status, 404);
    const deleteB = await request(base, `/operations/maintenance/${jobId}`, { method: 'DELETE', cookie: cookieB });
    assert.equal(deleteB.status, 404);

    const tenantB = await json<{ tenant: { id: string } }>(base, '/tenants', {
      method: 'POST',
      cookie: cookieB,
      body: JSON.stringify({
        propertyId: propertyB.id,
        firstName: 'Other',
        lastName: 'Tenant',
        moveInDate: '2026-09-01',
      }),
    });
    const stolenTenant = await request(base, `/operations/maintenance/${jobId}`, {
      method: 'PATCH',
      cookie: cookieA,
      body: JSON.stringify({ tenantId: tenantB.tenant.id }),
    });
    assert.equal(stolenTenant.status, 404);

    const updated = await json<{
      maintenance: { status: string; provider: string | null; estimatedCost: number | null };
    }>(base, `/operations/maintenance/${jobId}`, {
      method: 'PATCH',
      cookie: cookieA,
      body: JSON.stringify({
        status: 'IN_PROGRESS',
        provider: 'Aqua Bristol',
        estimatedCost: 180,
      }),
    });
    assert.equal(updated.maintenance.status, 'IN_PROGRESS');
    assert.equal(updated.maintenance.provider, 'Aqua Bristol');
    assert.equal(updated.maintenance.estimatedCost, 180);

    const dashboardOpen = await json<{ alerts: Array<{ kind: string; title: string }> }>(base, '/dashboard', {
      cookie: cookieA,
    });
    assert.ok(
      dashboardOpen.alerts.some((alert) => alert.kind === 'MAINTENANCE' && alert.title.includes('Kitchen leak')),
      'open maintenance should appear on the dashboard',
    );

    const completed = await json<{ maintenance: { status: string; actualCost: number | null } }>(
      base,
      `/operations/maintenance/${jobId}`,
      {
        method: 'PATCH',
        cookie: cookieA,
        body: JSON.stringify({ status: 'COMPLETED', actualCost: 210 }),
      },
    );
    assert.equal(completed.maintenance.status, 'COMPLETED');
    assert.equal(completed.maintenance.actualCost, 210);

    const expense = await json<{ expense: { id: string; amount: number; currency: string; maintenanceId: string } }>(
      base,
      `/operations/maintenance/${jobId}/expense`,
      { method: 'POST', cookie: cookieA, body: JSON.stringify({}) },
    );
    assert.equal(expense.expense.amount, 210);
    assert.equal(expense.expense.currency, 'GBP');
    assert.equal(expense.expense.maintenanceId, jobId);

    const persistedExpense = await json<{ expenses: Array<{ id: string }> }>(base, '/operations/expenses', {
      cookie: cookieA,
    });
    assert.equal(persistedExpense.expenses.length, 1);

    const duplicate = await request(base, `/operations/maintenance/${jobId}/expense`, {
      method: 'POST',
      cookie: cookieA,
      body: JSON.stringify({}),
    });
    assert.equal(duplicate.status, 409);

    const blockedDelete = await request(base, `/operations/maintenance/${jobId}`, {
      method: 'DELETE',
      cookie: cookieA,
    });
    assert.equal(blockedDelete.status, 409);

    const extra = await json<{ maintenance: { id: string } }>(base, '/operations/maintenance', {
      method: 'POST',
      cookie: cookieA,
      body: JSON.stringify({ propertyId: propertyA.id, title: 'Boiler service', priority: 'LOW' }),
    });
    const listed = await json<{ maintenance: Array<{ id: string; title: string }> }>(base, '/operations/maintenance', {
      cookie: cookieA,
    });
    assert.equal(listed.maintenance.length, 2);
    const deleted = await request(base, `/operations/maintenance/${extra.maintenance.id}`, {
      method: 'DELETE',
      cookie: cookieA,
    });
    assert.equal(deleted.status, 204);
    const afterDelete = await json<{ maintenance: Array<{ id: string }> }>(base, '/operations/maintenance', {
      cookie: cookieA,
    });
    assert.equal(afterDelete.maintenance.length, 1);
    assert.equal(afterDelete.maintenance[0].id, jobId);

    console.log('Maintenance workflow tests passed');
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

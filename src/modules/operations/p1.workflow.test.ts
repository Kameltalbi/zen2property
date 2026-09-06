import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../../app';
import { pool } from '../../db/pool';
import { processReminders } from '../../jobs/reminders';
import { markLatePayments } from '../payments/rentSchedule';

const EMAIL_A = 'p1-workflow-a@rentelyo.test';
const EMAIL_B = 'p1-workflow-b@rentelyo.test';
const PASSWORD = 'P1-workflow-pass!';

type Json = Record<string, unknown>;

function sessionCookie(res: Response): string {
  const parts = res.headers.getSetCookie();
  const session = parts.find((part) => part.startsWith('rentelyo_session='));
  assert.ok(session, 'register/login must set rentelyo_session');
  return session.split(';')[0];
}

function sessionCookieSafe(res: Response): string {
  try {
    return sessionCookie(res);
  } catch {
    return '';
  }
}

function isoDaysFromNow(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
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
  const like = 'p1-workflow-%@rentelyo.test';
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
  if (init.body && !(init.body instanceof FormData) && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }
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

async function json<T>(base: string, path: string, init: RequestInit & { cookie?: string } = {}): Promise<T> {
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
      body: JSON.stringify({ email: EMAIL_A, password: PASSWORD, fullName: 'P1 Landlord A', countryCode: 'GB' }),
    });
    assert.equal(registeredA.status, 201);
    const cookieA = registeredA.cookie;
    const registeredB = await request(base, '/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: EMAIL_B, password: PASSWORD, fullName: 'P1 Landlord B', countryCode: 'GB' }),
    });
    assert.equal(registeredB.status, 201);
    const cookieB = registeredB.cookie;

    const property = await json<{ property: { id: string; currency: string } }>(base, '/properties', {
      method: 'POST',
      cookie: cookieA,
      body: JSON.stringify({
        name: 'P1 House',
        address: '1 Workflow Street',
        city: 'Bristol',
        countryCode: 'GB',
        type: 'HOUSE',
        monthlyRent: 1000,
        monthlyCharges: 50,
        currency: 'GBP',
      }),
    });
    const propertyId = property.property.id;

    const tenant = await json<{ tenant: { id: string } }>(base, '/tenants', {
      method: 'POST',
      cookie: cookieA,
      body: JSON.stringify({
        propertyId,
        firstName: 'Sam',
        lastName: 'Tenant',
        moveInDate: dates.start,
        deposit: 1000,
      }),
    });
    const secondTenant = await request(base, '/tenants', {
      method: 'POST',
      cookie: cookieA,
      body: JSON.stringify({
        propertyId,
        firstName: 'Blocked',
        lastName: 'Tenant',
        moveInDate: dates.start,
      }),
    });
    assert.equal(secondTenant.status, 402, 'free plan must enforce maxTenants');

    const lease = await json<{
      lease: { id: string; monthlyRent: number; proposedIncrease: { canApply: boolean; newRent: number | null } | null };
    }>(base, '/leases', {
      method: 'POST',
      cookie: cookieA,
      body: JSON.stringify({
        propertyId,
        tenantId: tenant.tenant.id,
        label: 'P1 lease',
        status: 'active',
        startDate: dates.start,
        endDate: isoDaysFromNow(20),
        monthlyRent: 1000,
        monthlyCharges: 50,
        currency: 'GBP',
        paymentDay: 1,
        rentIncreaseFrequency: 'yearly',
        rentIncreaseType: 'percent',
        rentIncreaseValue: 10,
        nextIncreaseDate: isoDaysFromNow(0),
      }),
    });
    assert.equal(lease.lease.proposedIncrease?.canApply, true);
    assert.equal(lease.lease.proposedIncrease?.newRent, 1100);

    const payments = await json<{ payments: Array<{ id: string; status: string; amount: number; dueDate: string; periodStart: string }> }>(
      base,
      '/payments',
      { cookie: cookieA },
    );
    assert.ok(payments.payments.length >= 1, 'rent periods must be generated from the lease');
    const monthKey = dates.start.slice(0, 7);
    const current =
      payments.payments.find((row) => String(row.periodStart).slice(0, 7) === monthKey) ||
      payments.payments.find((row) => String(row.dueDate).slice(0, 7) === monthKey) ||
      payments.payments.find((row) => Number(row.amount) === 1050);
    assert.ok(current, `current month rent period must exist: ${JSON.stringify(payments.payments)} month=${monthKey}`);
    assert.equal(Number(current.amount), 1050);

    const isolatedPayments = await json<{ payments: unknown[] }>(base, '/payments', { cookie: cookieB });
    assert.equal(isolatedPayments.payments.length, 0);

    const paid = await json<{ payment: { status: string } }>(base, `/payments/${current.id}/mark-paid`, {
      method: 'POST',
      cookie: cookieA,
      body: JSON.stringify({ method: 'BANK_TRANSFER' }),
    });
    assert.equal(paid.payment.status, 'PAID');

    const receipt = await json<{ receipt: { id: string } }>(base, `/payments/${current.id}/receipt`, {
      method: 'POST',
      cookie: cookieA,
    });
    const pdf = await fetch(`${base}/receipts/${receipt.receipt.id}/pdf`, { headers: { cookie: cookieA } });
    assert.equal(pdf.status, 200);

    const overdue = await json<{ payment: { id: string; status: string } }>(base, '/payments', {
      method: 'POST',
      cookie: cookieA,
      body: JSON.stringify({
        propertyId,
        tenantId: tenant.tenant.id,
        amount: 1050,
        rentAmount: 1000,
        chargesAmount: 50,
        currency: 'GBP',
        periodStart: '2020-01-01',
        periodEnd: '2020-01-31',
        dueDate: isoDaysFromNow(-10),
        status: 'PENDING',
      }),
    });
    await markLatePayments((await json<{ user: { id: string } }>(base, '/me', { cookie: cookieA })).user.id);
    const late = await json<{ payment: { status: string } }>(base, `/payments/${overdue.payment.id}`, { cookie: cookieA });
    assert.equal(late.payment.status, 'LATE');

    const expense = await json<{ expense: { id: string; amount: number; recurring: boolean } }>(base, '/operations/expenses', {
      method: 'POST',
      cookie: cookieA,
      body: JSON.stringify({
        propertyId,
        category: 'INSURANCE',
        label: 'Building insurance',
        amount: 120,
        currency: 'GBP',
        expenseDate: dates.start,
        recurring: true,
      }),
    });
    assert.equal(expense.expense.amount, 120);
    const patchedExpense = await json<{ expense: { label: string } }>(base, `/operations/expenses/${expense.expense.id}`, {
      method: 'PATCH',
      cookie: cookieA,
      body: JSON.stringify({ label: 'Building insurance 2026' }),
    });
    assert.equal(patchedExpense.expense.label, 'Building insurance 2026');
    const stolenExpense = await request(base, `/operations/expenses/${expense.expense.id}`, {
      method: 'PATCH',
      cookie: cookieB,
      body: JSON.stringify({ label: 'stolen' }),
    });
    assert.equal(stolenExpense.status, 404);

    const job = await json<{ maintenance: { id: string } }>(base, '/operations/maintenance', {
      method: 'POST',
      cookie: cookieA,
      body: JSON.stringify({
        propertyId,
        tenantId: tenant.tenant.id,
        title: 'Boiler repair',
        priority: 'HIGH',
        status: 'COMPLETED',
        actualCost: 80,
      }),
    });
    const converted = await json<{ expense: { amount: number; maintenanceId: string } }>(
      base,
      `/operations/maintenance/${job.maintenance.id}/expense`,
      { method: 'POST', cookie: cookieA, body: JSON.stringify({ currency: 'GBP' }) },
    );
    assert.equal(converted.expense.amount, 80);
    assert.equal(converted.expense.maintenanceId, job.maintenance.id);

    const form = new FormData();
    form.append('file', new Blob(['lease-file'], { type: 'text/plain' }), 'lease.txt');
    form.append('title', 'Signed lease');
    form.append('category', 'CONTRACT');
    form.append('propertyId', propertyId);
    form.append('tenantId', tenant.tenant.id);
    form.append('leaseId', lease.lease.id);
    const uploaded = await request(base, '/documents', { method: 'POST', cookie: cookieA, body: form });
    assert.equal(uploaded.status, 201, JSON.stringify(uploaded.body));
    const document = uploaded.body.document as { id: string; fileName: string };
    assert.equal(document.fileName, 'lease.txt');

    const stolenDoc = await request(base, `/documents/${document.id}`, { cookie: cookieB });
    assert.equal(stolenDoc.status, 404);
    const stolenFile = await fetch(`${base}/documents/${document.id}/file`, { headers: { cookie: cookieB } });
    assert.equal(stolenFile.status, 404);
    const ownFile = await fetch(`${base}/documents/${document.id}/file`, { headers: { cookie: cookieA } });
    assert.equal(ownFile.status, 200);
    assert.equal(await ownFile.text(), 'lease-file');

    const dashboard = await json<{
      expectedThisMonth: number;
      collectedThisMonth: number;
      expensesThisMonth: number;
      netThisMonth: number;
      lateCount: number;
      alerts: Array<{ kind: string; id: string }>;
    }>(base, '/dashboard', { cookie: cookieA });
    assert.equal(dashboard.collectedThisMonth, 1050);
    assert.ok(dashboard.expensesThisMonth >= 200);
    assert.equal(dashboard.netThisMonth, dashboard.collectedThisMonth - dashboard.expensesThisMonth);
    assert.ok(dashboard.lateCount >= 1);
    assert.ok(dashboard.alerts.some((alert) => alert.kind === 'LEASE_EXPIRY'));
    assert.ok(dashboard.alerts.some((alert) => alert.kind === 'RENT_INCREASE' || alert.kind === 'LEASE_EXPIRY'));

    const rentCsv = await fetch(`${base}/reports/rent.csv`, { headers: { cookie: cookieA } });
    assert.equal(rentCsv.status, 200);
    const rentText = await rentCsv.text();
    assert.match(rentText, /period_start,period_end,due_date,status/);
    assert.match(rentText, /P1 House/);
    const stolenCsv = await fetch(`${base}/reports/rent.csv`, { headers: { cookie: cookieB } });
    const stolenText = await stolenCsv.text();
    assert.doesNotMatch(stolenText, /P1 House/);

    const me = await json<{ user: { id: string } }>(base, '/me', { cookie: cookieA });
    const firstReminders = await processReminders(me.user.id);
    assert.ok(firstReminders.sent >= 1);
    const secondReminders = await processReminders(me.user.id);
    assert.equal(secondReminders.sent, 0, 'duplicate reminders must not be recorded');
    const notes = await pool.query(
      `SELECT kind FROM notifications WHERE user_id = $1 ORDER BY kind`,
      [me.user.id],
    );
    const kinds = notes.rows.map((row) => row.kind);
    assert.ok(kinds.includes('RENT_OVERDUE'));
    assert.ok(kinds.includes('LEASE_EXPIRY'));

    const applied = await json<{ lease: { monthlyRent: number } }>(base, `/leases/${lease.lease.id}/apply-increase`, {
      method: 'POST',
      cookie: cookieA,
    });
    assert.equal(applied.lease.monthlyRent, 1100);
    const stolenIncrease = await request(base, `/leases/${lease.lease.id}/apply-increase`, {
      method: 'POST',
      cookie: cookieB,
    });
    assert.equal(stolenIncrease.status, 404);

    const deletedDoc = await request(base, `/documents/${document.id}`, { method: 'DELETE', cookie: cookieA });
    assert.equal(deletedDoc.status, 204);
    const afterDelete = await json<{ documents: unknown[] }>(base, '/documents', { cookie: cookieA });
    assert.equal(afterDelete.documents.length, 0);

    const deletedExpense = await request(base, `/operations/expenses/${expense.expense.id}`, {
      method: 'DELETE',
      cookie: cookieA,
    });
    assert.equal(deletedExpense.status, 204);

    console.log('P1 workflow tests passed');
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

import { query, queryOne } from '../../db/pool';

type ActiveLease = {
  id: string;
  user_id: string;
  property_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string | null;
  monthly_rent: string;
  monthly_charges: string;
  currency: string;
  payment_day: number;
  payment_frequency: 'monthly' | 'quarterly';
};

function isoDay(year: number, monthIndex: number, day: number): string {
  const last = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const d = Math.min(day, last);
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function lastIsoOfMonth(year: number, monthIndex: number): string {
  const last = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(last).padStart(2, '0')}`;
}

function parseIso(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return { y, m, d };
}

function addMonths(year: number, monthIndex: number, count: number): { y: number; m: number } {
  const abs = year * 12 + monthIndex + count;
  return { y: Math.floor(abs / 12), m: abs % 12 };
}

function horizonEnd(today = new Date()): { y: number; m: number } {
  return addMonths(today.getUTCFullYear(), today.getUTCMonth(), 1);
}

export async function markLatePayments(userId?: string): Promise<number> {
  const count = await queryOne<{ n: string }>(
    userId
      ? `WITH updated AS (
           UPDATE payments SET status = 'LATE', updated_at = now()
           WHERE user_id = $1 AND status = 'PENDING' AND due_date < CURRENT_DATE
           RETURNING id
         ) SELECT COUNT(*)::text AS n FROM updated`
      : `WITH updated AS (
           UPDATE payments SET status = 'LATE', updated_at = now()
           WHERE status = 'PENDING' AND due_date < CURRENT_DATE
           RETURNING id
         ) SELECT COUNT(*)::text AS n FROM updated`,
    userId ? [userId] : [],
  );
  return Number(count?.n ?? 0);
}

export async function generateRentPeriods(userId?: string): Promise<number> {
  const leases = userId
    ? await query<ActiveLease>(
        `SELECT id, user_id, property_id, tenant_id, start_date::text, end_date::text,
                monthly_rent::text, monthly_charges::text, currency, payment_day, payment_frequency
         FROM leases WHERE user_id = $1 AND status = 'active'`,
        [userId],
      )
    : await query<ActiveLease>(
        `SELECT id, user_id, property_id, tenant_id, start_date::text, end_date::text,
                monthly_rent::text, monthly_charges::text, currency, payment_day, payment_frequency
         FROM leases WHERE status = 'active'`,
      );

  const until = horizonEnd();
  let created = 0;
  for (const lease of leases) {
    created += await generateForLease(lease, until);
  }
  return created;
}

async function generateForLease(lease: ActiveLease, until: { y: number; m: number }): Promise<number> {
  const step = lease.payment_frequency === 'quarterly' ? 3 : 1;
  const start = parseIso(lease.start_date);
  const end = lease.end_date ? parseIso(lease.end_date) : null;
  let year = start.y;
  let monthIndex = start.m - 1;
  let created = 0;

  while (year < until.y || (year === until.y && monthIndex <= until.m)) {
    const periodStart = isoDay(year, monthIndex, 1);
    const periodEndMonth = addMonths(year, monthIndex, step - 1);
    const periodEnd = lastIsoOfMonth(periodEndMonth.y, periodEndMonth.m);
    if (periodEnd < lease.start_date.slice(0, 10)) {
      const next = addMonths(year, monthIndex, step);
      year = next.y;
      monthIndex = next.m;
      continue;
    }
    if (end && periodStart > lease.end_date!.slice(0, 10)) break;

    const due = isoDay(year, monthIndex, lease.payment_day);
    const rent = Number(lease.monthly_rent) * step;
    const charges = Number(lease.monthly_charges) * step;
    try {
      const inserted = await queryOne<{ id: string }>(
        `INSERT INTO payments (
           user_id, property_id, tenant_id, lease_id, amount, rent_amount, charges_amount, currency,
           period_start, period_end, due_date, status, description
         )
         SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9::date, $10::date, $11::date, 'PENDING', 'Scheduled rent'
         WHERE NOT EXISTS (
           SELECT 1 FROM payments p
           WHERE p.user_id = $1
             AND p.period_start = $9::date
             AND (
               p.lease_id = $4
               OR (p.property_id = $2 AND p.tenant_id IS NOT DISTINCT FROM $3)
             )
         )
         RETURNING id`,
        [
          lease.user_id,
          lease.property_id,
          lease.tenant_id,
          lease.id,
          rent + charges,
          rent,
          charges,
          lease.currency,
          periodStart,
          periodEnd,
          due,
        ],
      );
      if (inserted) created += 1;
    } catch (err) {
      const code = typeof err === 'object' && err && 'code' in err ? String((err as { code: unknown }).code) : '';
      if (code !== '23505') throw err;
    }

    const next = addMonths(year, monthIndex, step);
    year = next.y;
    monthIndex = next.m;
  }
  return created;
}

export async function syncRentLedger(userId?: string): Promise<{ generated: number; markedLate: number }> {
  const generated = await generateRentPeriods(userId);
  const markedLate = await markLatePayments(userId);
  return { generated, markedLate };
}

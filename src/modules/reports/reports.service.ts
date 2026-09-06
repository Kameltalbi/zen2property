import { query } from '../../db/pool';

function csvEscape(value: unknown): string {
  const text = value == null ? '' : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function toCsv(headers: string[], rows: Array<Record<string, unknown>>): string {
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((key) => csvEscape(row[key])).join(','));
  }
  return `${lines.join('\n')}\n`;
}

function iso(value: unknown): string {
  return String(value ?? '').slice(0, 10);
}

export async function rentReportCsv(userId: string): Promise<{ filename: string; csv: string }> {
  const rows = await query<Record<string, unknown>>(
    `SELECT p.period_start, p.period_end, p.due_date, p.status, p.amount, p.currency,
            p.rent_amount, p.charges_amount, pr.name AS property, t.first_name, t.last_name
     FROM payments p
     JOIN properties pr ON pr.id = p.property_id
     LEFT JOIN tenants t ON t.id = p.tenant_id
     WHERE p.user_id = $1
     ORDER BY p.due_date DESC`,
    [userId],
  );
  const csv = toCsv(
    ['period_start', 'period_end', 'due_date', 'status', 'amount', 'currency', 'rent_amount', 'charges_amount', 'property', 'tenant'],
    rows.map((row) => ({
      period_start: iso(row.period_start),
      period_end: iso(row.period_end),
      due_date: iso(row.due_date),
      status: row.status,
      amount: row.amount,
      currency: row.currency,
      rent_amount: row.rent_amount,
      charges_amount: row.charges_amount,
      property: row.property,
      tenant: [row.first_name, row.last_name].filter(Boolean).join(' '),
    })),
  );
  return { filename: 'rentelyo-rent.csv', csv };
}

export async function expenseReportCsv(userId: string): Promise<{ filename: string; csv: string }> {
  const rows = await query<Record<string, unknown>>(
    `SELECT e.expense_date, e.category, e.label, e.amount, e.currency, e.vendor, e.recurring, p.name AS property
     FROM expenses e
     JOIN properties p ON p.id = e.property_id
     WHERE e.user_id = $1
     ORDER BY e.expense_date DESC`,
    [userId],
  );
  const csv = toCsv(
    ['expense_date', 'property', 'category', 'label', 'amount', 'currency', 'vendor', 'recurring'],
    rows.map((row) => ({
      expense_date: iso(row.expense_date),
      property: row.property,
      category: row.category,
      label: row.label,
      amount: row.amount,
      currency: row.currency,
      vendor: row.vendor,
      recurring: row.recurring,
    })),
  );
  return { filename: 'rentelyo-expenses.csv', csv };
}

export async function propertySummaryCsv(userId: string): Promise<{ filename: string; csv: string }> {
  const rows = await query<Record<string, unknown>>(
    `SELECT
       p.name, p.city, p.type, p.currency,
       (SELECT COUNT(*) FROM tenants t WHERE t.property_id = p.id AND t.move_out_date IS NULL) AS tenants,
       (SELECT COALESCE(SUM(pay.amount), 0) FROM payments pay WHERE pay.property_id = p.id AND pay.status = 'PAID'
          AND date_trunc('month', pay.paid_date) = date_trunc('month', CURRENT_DATE)) AS collected_this_month,
       (SELECT COALESCE(SUM(pay.amount), 0) FROM payments pay WHERE pay.property_id = p.id
          AND date_trunc('month', pay.due_date) = date_trunc('month', CURRENT_DATE)) AS expected_this_month,
       (SELECT COALESCE(SUM(e.amount), 0) FROM expenses e WHERE e.property_id = p.id
          AND date_trunc('month', e.expense_date) = date_trunc('month', CURRENT_DATE)) AS expenses_this_month
     FROM properties p
     WHERE p.user_id = $1
     ORDER BY p.name`,
    [userId],
  );
  const csv = toCsv(
    ['name', 'city', 'type', 'currency', 'tenants', 'expected_this_month', 'collected_this_month', 'expenses_this_month', 'net_this_month'],
    rows.map((row) => ({
      name: row.name,
      city: row.city,
      type: row.type,
      currency: row.currency,
      tenants: row.tenants,
      expected_this_month: row.expected_this_month,
      collected_this_month: row.collected_this_month,
      expenses_this_month: row.expenses_this_month,
      net_this_month: Number(row.collected_this_month) - Number(row.expenses_this_month),
    })),
  );
  return { filename: 'rentelyo-properties.csv', csv };
}

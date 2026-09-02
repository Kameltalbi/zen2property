import { query, queryOne } from '../../db/pool';

type DashboardRow = {
  total_properties: string;
  occupied_units: string;
  collected_this_month: string;
  expected_this_month: string;
  expenses_this_month: string;
  late_count: string;
  pending_count: string;
};

export async function getDashboard(userId: string) {
  const row = await queryOne<DashboardRow>(
    `WITH occupied AS (
       SELECT DISTINCT property_id
       FROM tenants
       WHERE user_id = $1 AND move_out_date IS NULL
     )
     SELECT
       (SELECT COUNT(*)::text FROM properties WHERE user_id = $1) AS total_properties,
       (SELECT COUNT(*)::text FROM occupied) AS occupied_units,
       (SELECT COALESCE(SUM(amount), 0)::text FROM payments
         WHERE user_id = $1 AND status = 'PAID'
           AND date_trunc('month', paid_date) = date_trunc('month', CURRENT_DATE)
       ) AS collected_this_month,
       (SELECT COALESCE(SUM(amount), 0)::text FROM payments
         WHERE user_id = $1
           AND date_trunc('month', due_date) = date_trunc('month', CURRENT_DATE)
       ) AS expected_this_month,
       (SELECT COALESCE(SUM(amount), 0)::text FROM expenses
         WHERE user_id = $1
           AND date_trunc('month', expense_date) = date_trunc('month', CURRENT_DATE)
       ) AS expenses_this_month,
       (SELECT COUNT(*)::text FROM payments WHERE user_id = $1 AND status = 'LATE') AS late_count,
       (SELECT COUNT(*)::text FROM payments WHERE user_id = $1 AND status = 'PENDING') AS pending_count`,
    [userId],
  );

  const alerts = await query<{
    id: string;
    kind: string;
    title: string;
    due_date: string;
  }>(
    `SELECT id, 'LATE_PAYMENT' AS kind,
            'Overdue payment · ' || amount::text || ' ' || currency AS title,
            due_date::text
     FROM payments
     WHERE user_id = $1 AND status = 'LATE'
     UNION ALL
     SELECT id, 'PENDING_PAYMENT' AS kind,
            'Due soon · ' || amount::text || ' ' || currency AS title,
            due_date::text
     FROM payments
     WHERE user_id = $1 AND status = 'PENDING' AND due_date <= CURRENT_DATE + INTERVAL '7 days'
     ORDER BY due_date
     LIMIT 8`,
    [userId],
  );

  const total = Number(row?.total_properties ?? 0);
  const occupied = Number(row?.occupied_units ?? 0);

  return {
    totalProperties: total,
    occupiedUnits: occupied,
    vacantUnits: Math.max(0, total - occupied),
    collectedThisMonth: Number(row?.collected_this_month ?? 0),
    expectedThisMonth: Number(row?.expected_this_month ?? 0),
    expensesThisMonth: Number(row?.expenses_this_month ?? 0),
    netThisMonth: Number(row?.collected_this_month ?? 0) - Number(row?.expenses_this_month ?? 0),
    lateCount: Number(row?.late_count ?? 0),
    pendingCount: Number(row?.pending_count ?? 0),
    alerts,
  };
}

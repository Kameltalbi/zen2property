import { query, queryOne } from '../db/pool';
import { mailConfigured, sendEmail } from '../lib/mail';

type UserPref = {
  id: string;
  email: string;
  full_name: string;
  rent_reminders_enabled: boolean;
  lease_expiry_reminders_enabled: boolean;
  lease_expiry_warning_days: number;
};

async function recordNotification(input: {
  userId: string;
  kind: string;
  title: string;
  body: string;
  entityType: string;
  entityId: string;
  dueAt: string;
}): Promise<boolean> {
  const inserted = await queryOne<{ id: string }>(
    `INSERT INTO notifications (user_id, kind, title, body, entity_type, entity_id, due_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7::timestamptz)
     ON CONFLICT (user_id, kind, entity_type, entity_id, due_at) DO NOTHING
     RETURNING id`,
    [input.userId, input.kind, input.title, input.body, input.entityType, input.entityId, input.dueAt],
  );
  return Boolean(inserted);
}

async function notify(user: UserPref, input: {
  kind: string;
  title: string;
  body: string;
  entityType: string;
  entityId: string;
  dueAt: string;
}): Promise<boolean> {
  const recorded = await recordNotification({
    userId: user.id,
    ...input,
  });
  if (!recorded) return false;
  if (!mailConfigured()) return true;
  try {
    await sendEmail({
      to: user.email,
      subject: input.title,
      html: `<p>${input.body}</p><p>— Rentelyo</p>`,
      text: input.body,
    });
  } catch (err) {
    console.error('Reminder email failed', input.kind, err);
  }
  return true;
}

export async function processReminders(userId?: string): Promise<{ sent: number }> {
  const users = userId
    ? await query<UserPref>(
        `SELECT id, email, full_name,
                COALESCE(rent_reminders_enabled, TRUE) AS rent_reminders_enabled,
                COALESCE(lease_expiry_reminders_enabled, TRUE) AS lease_expiry_reminders_enabled,
                COALESCE(lease_expiry_warning_days, 60) AS lease_expiry_warning_days
         FROM users WHERE id = $1 AND is_active = TRUE`,
        [userId],
      )
    : await query<UserPref>(
        `SELECT id, email, full_name,
                COALESCE(rent_reminders_enabled, TRUE) AS rent_reminders_enabled,
                COALESCE(lease_expiry_reminders_enabled, TRUE) AS lease_expiry_reminders_enabled,
                COALESCE(lease_expiry_warning_days, 60) AS lease_expiry_warning_days
         FROM users WHERE is_active = TRUE`,
      );

  let sent = 0;
  for (const user of users) {
    if (user.rent_reminders_enabled) {
      const upcoming = await query<{ id: string; amount: string; currency: string; due_date: string }>(
        `SELECT id, amount::text, currency, due_date::text
         FROM payments
         WHERE user_id = $1 AND status = 'PENDING'
           AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'`,
        [user.id],
      );
      for (const payment of upcoming) {
        const created = await notify(user, {
          kind: 'RENT_UPCOMING',
          title: 'Upcoming rent due',
          body: `A rent of ${payment.amount} ${payment.currency} is due on ${payment.due_date.slice(0, 10)}.`,
          entityType: 'payment',
          entityId: payment.id,
          dueAt: `${payment.due_date.slice(0, 10)}T00:00:00.000Z`,
        });
        if (created) sent += 1;
      }
      const overdue = await query<{ id: string; amount: string; currency: string; due_date: string }>(
        `SELECT id, amount::text, currency, due_date::text
         FROM payments WHERE user_id = $1 AND status = 'LATE'`,
        [user.id],
      );
      for (const payment of overdue) {
        const created = await notify(user, {
          kind: 'RENT_OVERDUE',
          title: 'Overdue rent',
          body: `A rent of ${payment.amount} ${payment.currency} was due on ${payment.due_date.slice(0, 10)} and is still unpaid.`,
          entityType: 'payment',
          entityId: payment.id,
          dueAt: `${payment.due_date.slice(0, 10)}T00:00:00.000Z`,
        });
        if (created) sent += 1;
      }
    }

    if (user.lease_expiry_reminders_enabled) {
      const leases = await query<{ id: string; end_date: string; label: string | null }>(
        `SELECT id, end_date::text, label
         FROM leases
         WHERE user_id = $1 AND status = 'active' AND end_date IS NOT NULL
           AND end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + ($2 || ' days')::interval`,
        [user.id, String(user.lease_expiry_warning_days)],
      );
      for (const lease of leases) {
        const created = await notify(user, {
          kind: 'LEASE_EXPIRY',
          title: 'Lease ending soon',
          body: `Lease ${lease.label || lease.id} ends on ${lease.end_date.slice(0, 10)}.`,
          entityType: 'lease',
          entityId: lease.id,
          dueAt: `${lease.end_date.slice(0, 10)}T00:00:00.000Z`,
        });
        if (created) sent += 1;
      }

      const increases = await query<{
        id: string;
        next_increase_date: string;
        monthly_rent: string;
        rent_increase_type: string;
        rent_increase_value: string;
        currency: string;
      }>(
        `SELECT id, next_increase_date::text, monthly_rent::text, rent_increase_type, rent_increase_value::text, currency
         FROM leases
         WHERE user_id = $1 AND status = 'active' AND rent_increase_frequency <> 'none'
           AND next_increase_date IS NOT NULL
           AND next_increase_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '60 days'`,
        [user.id],
      );
      for (const lease of increases) {
        const created = await notify(user, {
          kind: 'RENT_INCREASE',
          title: 'Upcoming rent increase',
          body: `A rent review is scheduled on ${lease.next_increase_date.slice(0, 10)} for ${lease.monthly_rent} ${lease.currency}. Confirm in the lease before changing the contractual rent.`,
          entityType: 'lease',
          entityId: lease.id,
          dueAt: `${lease.next_increase_date.slice(0, 10)}T00:00:00.000Z`,
        });
        if (created) sent += 1;
      }
    }
  }
  return { sent };
}

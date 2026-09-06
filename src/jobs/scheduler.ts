import { generateRentPeriods, markLatePayments } from '../modules/payments/rentSchedule';
import { processReminders } from './reminders';

export async function runOperationalJobs(userId?: string): Promise<{
  generated: number;
  markedLate: number;
  reminders: number;
}> {
  const generated = await generateRentPeriods(userId);
  const markedLate = await markLatePayments(userId);
  const reminders = await processReminders(userId);
  return { generated, markedLate, reminders: reminders.sent };
}

export function startOperationalJobs(intervalMs = 15 * 60_000): NodeJS.Timeout {
  const timer = setInterval(() => {
    void runOperationalJobs().catch((err) => console.error('Operational jobs failed', err));
  }, intervalMs);
  timer.unref();
  setTimeout(() => {
    void runOperationalJobs().catch((err) => console.error('Operational jobs failed', err));
  }, 5_000).unref();
  return timer;
}

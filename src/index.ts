import { createApp } from './app';
import { env } from './config/env';
import { pool } from './db/pool';
import { startOperationalJobs } from './jobs/scheduler';

const app = createApp();

const server = app.listen(env.PORT, env.HOST, () => {
  console.log(`Rentelyo listening on http://${env.HOST}:${env.PORT}`);
});

if (env.NODE_ENV !== 'test') {
  try {
    startOperationalJobs();
  } catch (err) {
    console.error('Failed to start operational jobs', err);
  }
}

async function shutdown(): Promise<void> {
  server.close();
  await pool.end();
}

process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());

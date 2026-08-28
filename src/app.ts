import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRouter, meRouter } from './modules/auth/auth.routes';
import { propertiesRouter } from './modules/properties/properties.routes';
import { tenantsRouter } from './modules/tenants/tenants.routes';
import { paymentsRouter } from './modules/payments/payments.routes';
import { receiptsRouter } from './modules/receipts/receipts.routes';
import { legalRouter } from './modules/legal/legal.routes';
import { aiRouter } from './modules/ai/ai.routes';
import { billingRouter } from './modules/billing/billing.routes';
import { dashboardRouter } from './modules/dashboard/dashboard.routes';
import { adminRouter } from './modules/admin/admin.routes';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/', (_req, res) => {
    res.redirect(env.APP_ORIGIN);
  });

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'zen2property-api' });
  });

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/me', meRouter);
  app.use('/api/v1/dashboard', dashboardRouter);
  app.use('/api/v1/properties', propertiesRouter);
  app.use('/api/v1/tenants', tenantsRouter);
  app.use('/api/v1/payments', paymentsRouter);
  app.use('/api/v1/receipts', receiptsRouter);
  app.use('/api/v1/legal', legalRouter);
  app.use('/api/v1/legal/ai', aiRouter);
  app.use('/api/v1/billing', billingRouter);
  app.use('/api/v1/admin', adminRouter);

  app.use(errorHandler);
  return app;
}

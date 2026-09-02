import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import { authRouter, meRouter } from './modules/auth/auth.routes';
import { propertiesRouter } from './modules/properties/properties.routes';
import { tenantsRouter } from './modules/tenants/tenants.routes';
import { leasesRouter } from './modules/leases/leases.routes';
import { paymentsRouter } from './modules/payments/payments.routes';
import { receiptsRouter } from './modules/receipts/receipts.routes';
import { legalRouter } from './modules/legal/legal.routes';
import { aiRouter } from './modules/ai/ai.routes';
import { billingRouter } from './modules/billing/billing.routes';
import { dashboardRouter } from './modules/dashboard/dashboard.routes';
import { adminRouter } from './modules/admin/admin.routes';
import { operationsRouter } from './modules/operations/operations.routes';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { asyncHandler } from './lib/asyncHandler';
import { handleStripeWebhook } from './modules/billing/stripeWebhook';
import { HttpError } from './lib/httpError';

export function createApp() {
  const app = express();
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: true, credentials: true }));

  // Stripe webhooks require the raw body for signature verification.
  app.post(
    '/api/v1/billing/webhook',
    express.raw({ type: 'application/json' }),
    asyncHandler(async (req, res) => {
      try {
        const signature = req.headers['stripe-signature'];
        const result = await handleStripeWebhook(
          req.body as Buffer,
          typeof signature === 'string' ? signature : undefined,
        );
        res.json(result);
      } catch (err) {
        const status = (err as { status?: number }).status ?? 400;
        const message = err instanceof Error ? err.message : 'Webhook error';
        if (status === 501) throw new HttpError(501, message);
        if (status >= 500) throw err;
        res.status(status).json({ error: message });
      }
    }),
  );

  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'rentelyo-api' });
  });

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/me', meRouter);
  app.use('/api/v1/dashboard', dashboardRouter);
  app.use('/api/v1/properties', propertiesRouter);
  app.use('/api/v1/tenants', tenantsRouter);
  app.use('/api/v1/leases', leasesRouter);
  app.use('/api/v1/payments', paymentsRouter);
  app.use('/api/v1/receipts', receiptsRouter);
  app.use('/api/v1/legal', legalRouter);
  app.use('/api/v1/legal/ai', aiRouter);
  app.use('/api/v1/billing', billingRouter);
  app.use('/api/v1/admin', adminRouter);
  app.use('/api/v1/operations', operationsRouter);

  if (env.NODE_ENV === 'production') {
    const webDist = path.resolve(__dirname, '../web/dist');
    app.use(express.static(webDist, { index: false, maxAge: '1h' }));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/') || req.path === '/health') return next();
      res.sendFile(path.join(webDist, 'index.html'), (err) => {
        if (err) next(err);
      });
    });
  } else {
    app.get('/', (_req, res) => {
      res.redirect(env.APP_ORIGIN);
    });
  }

  app.use(errorHandler);
  return app;
}

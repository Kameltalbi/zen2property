import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../lib/asyncHandler';
import { z } from 'zod';
import {
  checkoutSchema,
  createCheckout,
  getBilling,
  listPlansForCountry,
  mockSubscribe,
  mockSubscribeSchema,
  updateBillingCountry,
} from './billing.service';
import { CANADIAN_PROVINCES } from './pricingMarkets';

export const billingRouter = Router();

billingRouter.get('/plans', (req, res) => {
  const country = typeof req.query.country === 'string' ? req.query.country : 'CA';
  res.json(listPlansForCountry(country));
});

billingRouter.get('/countries', (_req, res) => {
  res.json({
    provinces: CANADIAN_PROVINCES,
    countries: [
      { code: 'CA', label: 'Canada' },
      { code: 'US', label: 'United States' },
      { code: 'FR', label: 'France' },
      { code: 'BE', label: 'Belgium' },
      { code: 'DE', label: 'Germany' },
      { code: 'ES', label: 'Spain' },
      { code: 'IT', label: 'Italy' },
      { code: 'NL', label: 'Netherlands' },
      { code: 'PT', label: 'Portugal' },
      { code: 'IE', label: 'Ireland' },
      { code: 'AT', label: 'Austria' },
      { code: 'TN', label: 'Tunisia' },
      { code: 'XX', label: 'Other country' },
    ],
  });
});

billingRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await getBilling(req.user!.id));
  }),
);

billingRouter.patch(
  '/country',
  requireAuth,
  validate(
    z.object({
      billingCountryCode: z.string().length(2),
      billingRegion: z.string().max(8).optional().nullable(),
      confirmCurrencyChange: z.boolean().optional(),
    }),
  ),
  asyncHandler(async (req, res) => {
    res.json(await updateBillingCountry(req.user!.id, req.body));
  }),
);

billingRouter.post(
  '/checkout',
  requireAuth,
  validate(checkoutSchema),
  asyncHandler(async (req, res) => {
    res.json(await createCheckout(req.user!.id, req.body.plan, req.body.billingPeriod));
  }),
);

billingRouter.post(
  '/mock-subscribe',
  requireAuth,
  validate(mockSubscribeSchema),
  asyncHandler(async (req, res) => {
    res.json(await mockSubscribe(req.user!.id, req.body.plan));
  }),
);

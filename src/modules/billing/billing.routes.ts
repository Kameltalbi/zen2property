import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../lib/asyncHandler';
import {
  checkoutSchema,
  createCheckout,
  getBilling,
  listPlans,
  mockSubscribe,
  mockSubscribeSchema,
} from './billing.service';

export const billingRouter = Router();

billingRouter.get('/plans', (_req, res) => {
  res.json({ plans: listPlans() });
});

billingRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await getBilling(req.user!.id));
  }),
);

billingRouter.post(
  '/checkout',
  requireAuth,
  validate(checkoutSchema),
  asyncHandler(async (req, res) => {
    res.json(await createCheckout(req.user!.id, req.body.plan));
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

import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../lib/asyncHandler';
import { issueReceipt } from '../receipts/receipts.service';
import {
  createPayment,
  createPaymentSchema,
  getPayment,
  listPayments,
  markPaid,
  markPaidSchema,
  updatePayment,
  updatePaymentSchema,
} from './payments.service';

export const paymentsRouter = Router();
paymentsRouter.use(requireAuth);

const listQuery = z.object({
  propertyId: z.string().uuid().optional(),
  tenantId: z.string().uuid().optional(),
  status: z.enum(['PAID', 'PENDING', 'LATE', 'PARTIAL']).optional(),
});

paymentsRouter.get(
  '/',
  validate(listQuery, 'query'),
  asyncHandler(async (req, res) => {
    res.json({
      payments: await listPayments(req.user!.id, {
        propertyId: req.query.propertyId as string | undefined,
        tenantId: req.query.tenantId as string | undefined,
        status: req.query.status as string | undefined,
      }),
    });
  }),
);

paymentsRouter.post(
  '/',
  validate(createPaymentSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json({ payment: await createPayment(req.user!.id, req.body) });
  }),
);

paymentsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json({ payment: await getPayment(req.user!.id, req.params.id) });
  }),
);

paymentsRouter.patch(
  '/:id',
  validate(updatePaymentSchema),
  asyncHandler(async (req, res) => {
    res.json({ payment: await updatePayment(req.user!.id, req.params.id, req.body) });
  }),
);

paymentsRouter.post(
  '/:id/mark-paid',
  validate(markPaidSchema),
  asyncHandler(async (req, res) => {
    res.json({ payment: await markPaid(req.user!.id, req.params.id, req.body) });
  }),
);

paymentsRouter.post(
  '/:id/receipt',
  asyncHandler(async (req, res) => {
    const receipt = await issueReceipt(req.user!.id, req.params.id);
    res.status(201).json({ receipt });
  }),
);

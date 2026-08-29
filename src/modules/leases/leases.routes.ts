import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../lib/asyncHandler';
import {
  createLease,
  createLeaseSchema,
  deleteLease,
  getLease,
  listLeases,
  updateLease,
  updateLeaseSchema,
} from './leases.service';

export const leasesRouter = Router();
leasesRouter.use(requireAuth);

const listQuery = z.object({
  propertyId: z.string().uuid().optional(),
  tenantId: z.string().uuid().optional(),
  status: z.enum(['draft', 'active', 'ended', 'terminated']).optional(),
});

leasesRouter.get(
  '/',
  validate(listQuery, 'query'),
  asyncHandler(async (req, res) => {
    res.json({
      leases: await listLeases(req.user!.id, {
        propertyId: req.query.propertyId as string | undefined,
        tenantId: req.query.tenantId as string | undefined,
        status: req.query.status as string | undefined,
      }),
    });
  }),
);

leasesRouter.post(
  '/',
  validate(createLeaseSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json({ lease: await createLease(req.user!.id, req.body) });
  }),
);

leasesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json({ lease: await getLease(req.user!.id, req.params.id) });
  }),
);

leasesRouter.patch(
  '/:id',
  validate(updateLeaseSchema),
  asyncHandler(async (req, res) => {
    res.json({ lease: await updateLease(req.user!.id, req.params.id, req.body) });
  }),
);

leasesRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await deleteLease(req.user!.id, req.params.id);
    res.status(204).end();
  }),
);

import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../lib/asyncHandler';
import {
  createTenant,
  createTenantSchema,
  deleteTenant,
  getTenant,
  listTenants,
  updateTenant,
  updateTenantSchema,
} from './tenants.service';

export const tenantsRouter = Router();
tenantsRouter.use(requireAuth);

const listQuery = z.object({
  propertyId: z.string().uuid().optional(),
});

tenantsRouter.get(
  '/',
  validate(listQuery, 'query'),
  asyncHandler(async (req, res) => {
    res.json({ tenants: await listTenants(req.user!.id, req.query.propertyId as string | undefined) });
  }),
);

tenantsRouter.post(
  '/',
  validate(createTenantSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json({ tenant: await createTenant(req.user!.id, req.body) });
  }),
);

tenantsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json({ tenant: await getTenant(req.user!.id, req.params.id) });
  }),
);

tenantsRouter.patch(
  '/:id',
  validate(updateTenantSchema),
  asyncHandler(async (req, res) => {
    res.json({ tenant: await updateTenant(req.user!.id, req.params.id, req.body) });
  }),
);

tenantsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await deleteTenant(req.user!.id, req.params.id);
    res.status(204).end();
  }),
);

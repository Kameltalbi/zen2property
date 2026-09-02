import { Router } from 'express';
import { requireAdmin, requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../lib/asyncHandler';
import {
  cancelAdminUser,
  createAdminUser,
  createUserSchema,
  deleteAdminUser,
  extendAdminUser,
  extendUserSchema,
  getAdminStats,
  listAdminUsers,
  listUsersQuery,
  patchAdminUser,
  patchUserSchema,
} from './admin.service';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

adminRouter.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    res.json(await getAdminStats());
  }),
);

adminRouter.get(
  '/users',
  validate(listUsersQuery, 'query'),
  asyncHandler(async (req, res) => {
    res.json(await listAdminUsers(req.query as unknown as { q?: string; page: number; limit: number }));
  }),
);

adminRouter.post(
  '/users',
  validate(createUserSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json({ user: await createAdminUser(req.body) });
  }),
);

adminRouter.patch(
  '/users/:id',
  validate(patchUserSchema),
  asyncHandler(async (req, res) => {
    res.json({ user: await patchAdminUser(req.user!.id, req.params.id, req.body) });
  }),
);

adminRouter.post(
  '/users/:id/cancel',
  asyncHandler(async (req, res) => {
    res.json({ user: await cancelAdminUser(req.user!.id, req.params.id) });
  }),
);

adminRouter.post(
  '/users/:id/extend',
  validate(extendUserSchema),
  asyncHandler(async (req, res) => {
    res.json({ user: await extendAdminUser(req.user!.id, req.params.id, req.body) });
  }),
);

adminRouter.delete(
  '/users/:id',
  asyncHandler(async (req, res) => {
    res.json(await deleteAdminUser(req.user!.id, req.params.id));
  }),
);

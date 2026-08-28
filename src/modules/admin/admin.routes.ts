import { Router } from 'express';
import { requireAdmin, requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../lib/asyncHandler';
import { getAdminStats, listAdminUsers, listUsersQuery, patchAdminUser, patchUserSchema } from './admin.service';

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

adminRouter.patch(
  '/users/:id',
  validate(patchUserSchema),
  asyncHandler(async (req, res) => {
    res.json({ user: await patchAdminUser(req.user!.id, req.params.id, req.body) });
  }),
);

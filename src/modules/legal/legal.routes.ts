import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../lib/asyncHandler';
import { getActiveLegalProfile, listCountries } from './legal.service';

export const legalRouter = Router();

legalRouter.get(
  '/countries',
  asyncHandler(async (_req, res) => {
    res.json({ countries: await listCountries() });
  }),
);

legalRouter.get(
  '/countries/:code',
  requireAuth,
  asyncHandler(async (req, res) => {
    const profile = await getActiveLegalProfile(req.params.code);
    res.json({ profile });
  }),
);

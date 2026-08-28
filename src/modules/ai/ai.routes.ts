import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../lib/asyncHandler';
import { applyDraft, listDrafts, proposeLegalUpdate, proposeSchema } from './ai.service';

export const aiRouter = Router();
aiRouter.use(requireAuth);

aiRouter.post(
  '/propose',
  validate(proposeSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await proposeLegalUpdate(req.body));
  }),
);

aiRouter.get(
  '/drafts',
  validate(z.object({ countryCode: z.string().length(2).optional() }), 'query'),
  asyncHandler(async (req, res) => {
    res.json({ drafts: await listDrafts(req.query.countryCode as string | undefined) });
  }),
);

aiRouter.post(
  '/drafts/:id/apply',
  asyncHandler(async (req, res) => {
    res.json(await applyDraft(req.params.id));
  }),
);

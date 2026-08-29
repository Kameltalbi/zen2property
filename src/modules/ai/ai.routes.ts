import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin, requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../lib/asyncHandler';
import {
  applyDraft,
  confirmDraft,
  confirmDraftSchema,
  getMyLegalState,
  listDrafts,
  proposeLegalUpdate,
  proposeSchema,
  saveManualLegalProfile,
  saveManualSchema,
} from './ai.service';

export const aiRouter = Router();
aiRouter.use(requireAuth);

aiRouter.post(
  '/propose',
  validate(proposeSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await proposeLegalUpdate(req.user!.id, req.body));
  }),
);

aiRouter.put(
  '/manual',
  validate(saveManualSchema),
  asyncHandler(async (req, res) => {
    res.json(await saveManualLegalProfile(req.user!.id, req.body));
  }),
);

aiRouter.get(
  '/mine/:code',
  asyncHandler(async (req, res) => {
    res.json(await getMyLegalState(req.user!.id, req.params.code));
  }),
);

aiRouter.get(
  '/drafts',
  validate(z.object({ countryCode: z.string().length(2).optional() }), 'query'),
  asyncHandler(async (req, res) => {
    res.json({
      drafts: await listDrafts(req.user!.id, req.user!.isAdmin, req.query.countryCode as string | undefined),
    });
  }),
);

aiRouter.post(
  '/drafts/:id/confirm',
  validate(confirmDraftSchema),
  asyncHandler(async (req, res) => {
    res.json(await confirmDraft(req.user!.id, req.params.id, req.body));
  }),
);

aiRouter.post(
  '/drafts/:id/apply',
  requireAdmin,
  asyncHandler(async (req, res) => {
    res.json(await applyDraft(req.params.id));
  }),
);

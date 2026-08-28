import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../lib/asyncHandler';
import { getMe, login, loginSchema, register, registerSchema, updateMe, updateMeSchema, forgotPassword, forgotPasswordSchema, resetPassword, resetPasswordSchema } from './auth.service';

export const authRouter = Router();

authRouter.post(
  '/register',
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const result = await register(req.body);
    res.status(201).json(result);
  }),
);

authRouter.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    res.json(await login(req.body));
  }),
);

authRouter.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  asyncHandler(async (req, res) => {
    res.json(await forgotPassword(req.body.email));
  }),
);

authRouter.post(
  '/reset-password',
  validate(resetPasswordSchema),
  asyncHandler(async (req, res) => {
    res.json(await resetPassword(req.body.token, req.body.password));
  }),
);

export const meRouter = Router();

meRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: await getMe(req.user!.id) });
  }),
);

meRouter.patch(
  '/',
  requireAuth,
  validate(updateMeSchema),
  asyncHandler(async (req, res) => {
    res.json({ user: await updateMe(req.user!.id, req.body) });
  }),
);

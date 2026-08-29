import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { queryOne } from '../db/pool';
import { HttpError } from '../lib/httpError';

export type AuthUser = {
  id: string;
  email: string;
  isAdmin: boolean;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new HttpError(401, 'Authentication required'));
    return;
  }

  try {
    const payload = jwt.verify(header.slice(7), env.JWT_SECRET) as { sub: string; email: string };
    const row = await queryOne<{ email: string; is_admin: boolean; is_active: boolean }>(
      'SELECT email, is_admin, is_active FROM users WHERE id = $1',
      [payload.sub],
    );
    if (!row || !row.is_active) {
      next(new HttpError(401, 'Account disabled or not found'));
      return;
    }
    req.user = { id: payload.sub, email: row.email, isAdmin: Boolean(row.is_admin) };
    next();
  } catch (err) {
    if (err instanceof HttpError) next(err);
    else next(new HttpError(401, 'Invalid or expired token'));
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user?.isAdmin) {
    next(new HttpError(403, 'Superadmin access required'));
    return;
  }
  next();
}

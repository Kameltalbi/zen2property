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

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  const cookieToken = parseCookie(req.headers.cookie, 'rentelyo_session');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : cookieToken;
  if (!token) {
    next(new HttpError(401, 'Authentication required'));
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] }) as { sub: string; email: string };
    const row = await queryOne<{ email: string; is_admin: boolean; is_active: boolean }>(
      'SELECT email, is_admin, is_active FROM users WHERE id = $1',
      [payload.sub],
    );
    if (!row || !row.is_active) {
      next(new HttpError(401, 'Account disabled or not found'));
      return;
    }
    req.user = { id: payload.sub, email: row.email, isAdmin: Boolean(row.is_admin) };
    // Transparently migrate legacy Bearer sessions to an HttpOnly cookie.
    if (header?.startsWith('Bearer ')) {
      res.cookie('rentelyo_session', token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }
    next();
  } catch (err) {
    if (err instanceof HttpError) next(err);
    else next(new HttpError(401, 'Invalid or expired token'));
  }
}

function parseCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [rawName, ...rawValue] = part.trim().split('=');
    if (rawName === name) return decodeURIComponent(rawValue.join('='));
  }
  return undefined;
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user?.isAdmin) {
    next(new HttpError(403, 'Superadmin access required'));
    return;
  }
  next();
}

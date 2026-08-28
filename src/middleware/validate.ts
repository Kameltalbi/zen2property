import { ZodSchema } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { HttpError } from '../lib/httpError';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
      next(new HttpError(400, message));
      return;
    }
    req[source] = parsed.data;
    next();
  };
}

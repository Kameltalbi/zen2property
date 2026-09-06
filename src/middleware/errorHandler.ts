import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../lib/httpError';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, ...(err.details ? { details: err.details } : {}) });
    return;
  }

  const code = typeof err === 'object' && err && 'code' in err ? String((err as { code: unknown }).code) : '';
  if (code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ error: 'File must be 10 MB or smaller.' });
    return;
  }

  console.error(err);
  res.status(500).json({ error: 'Internal error' });
}

import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../lib/httpError';

type Entry = { count: number; resetAt: number };
const buckets = new Map<string, Entry>();

export function rateLimit(options: { windowMs: number; max: number; prefix: string }) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const key = `${options.prefix}:${req.ip ?? req.socket.remoteAddress ?? 'unknown'}`;
    const previous = buckets.get(key);
    const entry = !previous || previous.resetAt <= now
      ? { count: 1, resetAt: now + options.windowMs }
      : { count: previous.count + 1, resetAt: previous.resetAt };
    buckets.set(key, entry);
    res.setHeader('RateLimit-Limit', String(options.max));
    res.setHeader('RateLimit-Remaining', String(Math.max(0, options.max - entry.count)));
    res.setHeader('RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));
    if (entry.count > options.max) {
      res.setHeader('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      next(new HttpError(429, 'Too many requests. Please try again later.'));
      return;
    }
    next();
  };
}

// Avoid unbounded memory growth in the single-process limiter.
const cleanup = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of buckets) if (entry.resetAt <= now) buckets.delete(key);
}, 60_000);
cleanup.unref();

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function notFound(entity: string): never {
  throw new HttpError(404, `${entity} not found`);
}

export function forbidden(): never {
  throw new HttpError(403, 'Forbidden');
}

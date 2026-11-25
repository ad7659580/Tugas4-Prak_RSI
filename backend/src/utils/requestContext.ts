import type { Request } from 'express';

export interface RequestContext {
  ipAddress: string | null;
  userAgent: string | null;
}

/** ip_address dan user_agent diambil dari HTTP request (bukan dari body yang dikirim klien). */
export function getRequestContext(req: Request): RequestContext {
  const ip = req.ip ?? req.socket.remoteAddress ?? null;
  const ua = req.get('user-agent') ?? null;
  return {
    ipAddress: ip,
    userAgent: ua ? ua.slice(0, 255) : null,
  };
}

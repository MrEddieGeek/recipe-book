// In-memory sliding-window rate limiter and body size guard

const hitMap = new Map<string, number[]>();

interface RateLimitConfig {
  windowMs: number;
  maxHits: number;
}

export const RATE_LIMITS = {
  GENERATE_RECIPE: { windowMs: 60_000, maxHits: 3 },
  EXTRACT_VIDEO: { windowMs: 60_000, maxHits: 2 },
  UPLOAD_IMAGE: { windowMs: 60_000, maxHits: 10 },
  DEFAULT: { windowMs: 60_000, maxHits: 30 },
} as const;

export function checkRateLimit(
  routeKey: string,
  config: RateLimitConfig = RATE_LIMITS.DEFAULT
): Response | null {
  const now = Date.now();
  const hits = hitMap.get(routeKey) ?? [];

  // Remove expired entries
  const valid = hits.filter((t) => now - t < config.windowMs);

  if (valid.length >= config.maxHits) {
    hitMap.set(routeKey, valid);
    return Response.json(
      { error: 'Demasiadas solicitudes. Intenta de nuevo en un momento.' },
      { status: 429 }
    );
  }

  valid.push(now);
  hitMap.set(routeKey, valid);
  return null;
}

export function checkBodySize(
  contentLength: string | null,
  maxBytes: number = 1_048_576 // 1 MB
): Response | null {
  if (contentLength && parseInt(contentLength, 10) > maxBytes) {
    return Response.json(
      { error: 'El cuerpo de la solicitud es demasiado grande.' },
      { status: 413 }
    );
  }
  return null;
}

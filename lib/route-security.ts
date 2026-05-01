import { getAdminAuth } from "@/lib/firebase-admin";

type RateLimitConfig = {
  limit: number;
  windowMs: number;
};

class RouteError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const rateLimitStore = new Map<string, number[]>();

export function getBearerToken(req: Request) {
  const header = req.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim();
}

export async function requireFirebaseUser(req: Request) {
  const token = getBearerToken(req);

  if (!token) {
    throw new RouteError("Missing authorization token", 401);
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return { token, uid: decoded.uid, decoded };
  } catch {
    throw new RouteError("Invalid or expired authorization token", 401);
  }
}

export function requireScraperSecret(req: Request) {
  const configuredSecret = process.env.SCRAPER_ACCESS_TOKEN?.trim();

  if (!configuredSecret) {
    if (process.env.NODE_ENV === "production") {
      throw new RouteError("Scraper access token is not configured", 500);
    }
    return;
  }

  const provided =
    getBearerToken(req) ?? req.headers.get("x-scraper-token")?.trim() ?? "";

  if (provided !== configuredSecret) {
    throw new RouteError("Unauthorized scraper request", 401);
  }
}

export function enforceRateLimit(key: string, config: RateLimitConfig) {
  const now = Date.now();
  const history = rateLimitStore.get(key) ?? [];
  const recent = history.filter((timestamp) => now - timestamp < config.windowMs);

  if (recent.length >= config.limit) {
    throw new RouteError("Rate limit exceeded", 429);
  }

  recent.push(now);
  rateLimitStore.set(key, recent);
}

export function getRouteErrorResponse(error: unknown) {
  if (error instanceof RouteError) {
    return { message: error.message, status: error.status };
  }

  const message = error instanceof Error ? error.message : "Internal server error";
  return { message, status: 500 };
}

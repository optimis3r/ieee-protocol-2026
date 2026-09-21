import crypto from 'crypto';

// Secret key for HMAC signing of admin session tokens
const ADMIN_SECRET = process.env.ADMIN_SECRET || (() => {
  // Generate stable process-lifetime random secret if not provided in env
  const secret = crypto.randomBytes(32).toString('hex');
  return secret;
})();

const DEFAULT_ADMIN_AGENT = 'ieee-protocol-admin';
const DEFAULT_ADMIN_PASSWORD = 'protocol2026';

/**
 * Timing-safe string comparison to prevent side-channel timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf-8');
    const bufB = Buffer.from(b, 'utf-8');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Validate admin login credentials against server environment variables
 */
export function verifyAdminCredentials(agentName?: string, password?: string): boolean {
  if (!agentName || !password) return false;

  const expectedAgent = process.env.ADMIN_AGENT_NAME || DEFAULT_ADMIN_AGENT;
  const expectedPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

  const agentMatches = timingSafeEqual(agentName.trim().toLowerCase(), expectedAgent.toLowerCase());
  const passMatches = timingSafeEqual(password.trim(), expectedPassword);

  return agentMatches && passMatches;
}

/**
 * Create a cryptographically signed admin session token valid for 12 hours
 */
export function createAdminToken(agentName: string = DEFAULT_ADMIN_AGENT): string {
  const expiresAt = Date.now() + 12 * 60 * 60 * 1000; // 12 hours
  const payload = `${agentName}:${expiresAt}`;
  const signature = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(payload)
    .digest('hex');
  
  return Buffer.from(`${payload}:${signature}`).toString('base64url');
}

/**
 * Verify an incoming admin session token
 */
export function verifyAdminToken(token: string | null | undefined): boolean {
  if (!token) return false;
  if (process.env.ADMIN_SECRET_TOKEN && token === process.env.ADMIN_SECRET_TOKEN) {
    return true;
  }

  try {
    const raw = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = raw.split(':');
    if (parts.length !== 3) return false;

    const [agentName, expiresAtStr, signature] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);

    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return false; // Token expired
    }

    const payload = `${agentName}:${expiresAtStr}`;
    const expectedSig = crypto
      .createHmac('sha256', ADMIN_SECRET)
      .update(payload)
      .digest('hex');

    return timingSafeEqual(signature, expectedSig);
  } catch {
    return false;
  }
}

/**
 * Check if incoming Request is authenticated as admin
 */
export function verifyAdminRequest(request: Request): boolean {
  const token = 
    request.headers.get('x-admin-token') ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    null;

  return verifyAdminToken(token);
}

// In-memory sliding window rate limiter
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up stale rate-limit keys every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref();
}

/**
 * In-memory sliding window rate limiter
 * @param key Unique key (e.g. IP + endpoint)
 * @param maxRequests Allowed requests in the window
 * @param windowMs Window duration in milliseconds
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 20,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetMs: windowMs };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetMs: Math.max(0, record.resetAt - now) };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count, resetMs: Math.max(0, record.resetAt - now) };
}

/**
 * Extract client IP from headers (supports reverse proxies like Render/Vercel/Cloudflare)
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

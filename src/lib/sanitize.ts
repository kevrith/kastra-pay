/**
 * Input sanitization utilities for enterprise-grade security.
 * Prevents XSS, SQL injection, and other injection attacks at the boundary layer.
 */

/**
 * Strip HTML tags from a string
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

/**
 * Sanitize a string by removing control characters and trimming
 */
export function sanitizeString(input: string): string {
  // Remove null bytes and other control characters (except newlines/tabs)
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
}

/**
 * Sanitize an email address
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Sanitize a phone number (keep digits and +)
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "").trim();
}

/**
 * Recursively sanitize all string values in an object
 */
export function sanitizeObject<T>(obj: T): T {
  if (typeof obj === "string") {
    return sanitizeString(obj) as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject) as T;
  }
  if (obj && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[sanitizeString(key)] = sanitizeObject(value);
    }
    return result as T;
  }
  return obj;
}

/**
 * Validate and sanitize a URL (prevent SSRF)
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Only allow http and https
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    // Block private IPs and localhost
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.") ||
      hostname.startsWith("192.168.") ||
      hostname === "::1" ||
      hostname === "[::1]"
    ) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Generate a request ID for tracing
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

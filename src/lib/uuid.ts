// =============================================
// UUID UTILITY - Browser-compatible
// =============================================
// Simple UUID v4 generator for client-side use
// Works in all browsers without crypto.randomUUID()

/**
 * Generate a UUID v4 (random UUID)
 * Compatible with all browsers
 */
export function generateUUID(): string {
  // Try native crypto.randomUUID first (modern browsers)
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: manual UUID v4 generation
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate a short random ID (8 characters)
 * Useful for temporary IDs in UI
 */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 10);
}

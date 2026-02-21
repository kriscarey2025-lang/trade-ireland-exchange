/**
 * Generate a URL-friendly slug from a service title + UUID.
 * Format: "guitar-lessons-in-carlow-<uuid>"
 * The UUID is always the last 36 characters, making extraction reliable.
 */
export function generateServiceSlug(title: string, id: string): string {
  const slug = title
    .toLowerCase()
    .replace(/['']/g, '')           // remove apostrophes
    .replace(/[^a-z0-9\s-]/g, '')   // remove special chars
    .replace(/\s+/g, '-')           // spaces to hyphens
    .replace(/-+/g, '-')            // collapse multiple hyphens
    .replace(/^-|-$/g, '')          // trim leading/trailing hyphens
    .slice(0, 60);                  // limit length

  return `${slug}-${id}`;
}

/**
 * Extract the UUID from a slug-based service URL parameter.
 * Supports both formats:
 * - Pure UUID: "abc-def-123-456-789" (36 chars)
 * - Slug+UUID: "guitar-lessons-abc-def-123-456-789" (last 36 chars)
 */
export function extractServiceId(slugOrId: string): string {
  // UUID v4 format: 8-4-4-4-12 = 36 chars
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const match = slugOrId.match(uuidRegex);
  return match ? match[0] : slugOrId;
}

/**
 * Build a service URL path with slug for use in links.
 */
export function serviceUrl(title: string, id: string): string {
  return `/services/${generateServiceSlug(title, id)}`;
}

/**
 * Build a full canonical service URL for SEO/sharing.
 */
export function serviceCanonicalUrl(title: string, id: string): string {
  return `https://swap-skills.ie/services/${generateServiceSlug(title, id)}`;
}

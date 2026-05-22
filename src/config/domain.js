// Domain configuration for Voice of Jesus Ministry
export const CANONICAL_DOMAIN = "voj.amazinggracehl.org";
export const FALLBACK_DOMAIN = "nexus.amazinggracehl.org";

// Helper for building URLs
export const url = (path = "") =>
  `https://${CANONICAL_DOMAIN}${path.startsWith("/") ? path : `/${path}`}`;

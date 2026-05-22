// Domain configuration for Voice of Jesus Ministry
export const CANONICAL_DOMAIN = "voj.amazinggracehl.org";
// Backup domain (portfolio site, scoped to /ministry to avoid conflicts)
export const FALLBACK_DOMAIN = "nicholai.org";
export const FALLBACK_BASE_PATH = "/ministry";

// Helper for building URLs on the canonical domain
export const url = (path = "") =>
  `https://${CANONICAL_DOMAIN}${path.startsWith("/") ? path : `/${path}`}`;

// Helper for building URLs on the fallback domain (nicholai.org/ministry)
export const fallbackUrl = (path = "") =>
  `https://${FALLBACK_DOMAIN}${FALLBACK_BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;

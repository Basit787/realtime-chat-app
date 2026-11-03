// Terms, privacy and cookie pages are hosted elsewhere: VITE_LEGAL_URL is their base, e.g. https://example.com
const LEGAL_BASE_URL = (import.meta.env.VITE_LEGAL_URL ?? "").replace(/\/$/, "");

export const legalUrl = (page: "terms" | "privacy" | "cookies") => `${LEGAL_BASE_URL}/${page}`;

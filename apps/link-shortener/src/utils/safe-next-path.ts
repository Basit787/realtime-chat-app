// The `next` query param as an in-app path; anything else (e.g. //evil.com) falls back to "/"
export const safeNextPath = (search: string) => {
  const next = new URLSearchParams(search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
};

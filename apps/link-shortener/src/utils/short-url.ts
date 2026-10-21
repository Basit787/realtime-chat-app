// Full short URL on the host this page was opened from (localhost, a LAN IP, a domain…)
export const shortUrl = (shortPath: string) =>
  typeof window === "undefined" ? shortPath : `${window.location.origin}${shortPath}`;

// A link as the API returns it
export type LinkDto = {
  id: string;
  slug: string;
  // Path on this app that redirects to `url`
  shortPath: string;
  url: string;
  title: string | null;
  clickCount: number;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

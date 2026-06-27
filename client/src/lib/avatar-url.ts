const resolveImageUrl = (imageUrl: string | null | undefined, fallback: string) => imageUrl || fallback;

export const userAvatarUrl = (username: string, imageUrl?: string | null) =>
  resolveImageUrl(imageUrl, `/api/profile/avatars/by-name/${encodeURIComponent(username)}`);

export const groupAvatarUrl = (groupId: string, imageUrl?: string | null) =>
  resolveImageUrl(imageUrl, `/api/groups/${groupId}/avatar`);

export type ImageDto = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  status: "scheduled" | "active";
  scheduledAt: string | null;
  deletedAt: string | null;
  // When a binned image is deleted for good
  purgeAt: string | null;
  createdAt: string;
};

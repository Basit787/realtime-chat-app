import type { ImageDto } from "./image-dto.js";

export type ImagePageDto = {
  images: ImageDto[];
  total: number;
  page: number;
  pageSize: number;
};

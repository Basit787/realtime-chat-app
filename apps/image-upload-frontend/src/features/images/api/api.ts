import { createApiError } from "frontend-common";
import { apiClient } from "@/lib/api-client";
import { imageEndpoints } from "./endpoint";

// Mirrors ImageDto in apps/image-upload-backend/src/types/image-dto.ts
export type UploadedImage = {
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

// One page of images; mirrors ImagePageDto in the backend
export type ImagePage = {
  images: UploadedImage[];
  total: number;
  page: number;
  pageSize: number;
};

// Mirrors ImageCountsDto in the backend
export type ImageCounts = { active: number; scheduled: number; bin: number };

export const fetchImages = async (status: UploadedImage["status"], page: number): Promise<ImagePage> => {
  const response = await apiClient.get<ImagePage>(imageEndpoints.list(status, page));
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to load images", response.status);
  }
  return response.data;
};

export const fetchBin = async (page: number): Promise<ImagePage> => {
  const response = await apiClient.get<ImagePage>(imageEndpoints.bin(page));
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to load the bin", response.status);
  }
  return response.data;
};

export const fetchImageCounts = async (): Promise<ImageCounts> => {
  const response = await apiClient.get<ImageCounts>(imageEndpoints.counts());
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to load image counts", response.status);
  }
  return response.data;
};

// `scheduledAt` (ISO) publishes the image later instead of right away
export const uploadImage = async (file: File, scheduledAt?: string): Promise<UploadedImage> => {
  const body = new FormData();
  body.append("file", file);
  if (scheduledAt) body.append("scheduledAt", scheduledAt);
  const response = await apiClient.postForm<UploadedImage>(imageEndpoints.upload(), body);
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to upload image", response.status);
  }
  return response.data;
};

export const downloadImage = async (id: string): Promise<Blob> => {
  const response = await apiClient.getBlob(imageEndpoints.file(id));
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to load image", response.status);
  }
  return response.data;
};

export const deleteImage = async (id: string): Promise<void> => {
  const response = await apiClient.delete<{ ok: true }>(imageEndpoints.remove(id));
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to delete image", response.status);
  }
};

export const restoreImage = async (id: string): Promise<UploadedImage> => {
  const response = await apiClient.post<UploadedImage>(imageEndpoints.restore(id));
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to restore image", response.status);
  }
  return response.data;
};

// Only images already in the bin can be deleted for good
export const purgeImage = async (id: string): Promise<void> => {
  const response = await apiClient.delete<{ ok: true }>(imageEndpoints.purge(id));
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to delete image", response.status);
  }
};

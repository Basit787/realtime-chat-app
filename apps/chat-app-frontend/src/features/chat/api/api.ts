import { apiClient } from "@/lib/api-client";
import { createApiError } from "frontend-common";
import { chatEndpoints } from "./endpoint";
import type {
  CallHistoryEntry,
  ChatGroup,
  ChatMessage,
  ContactProfile,
  CreateGroupPayload,
  UpdateGroupPayload,
} from "frontend-common";

export type {
  MessageFile,
  ChatMessage,
  MessageDeliveryStatus,
  CallType,
  GroupCallState,
  CallStatus,
  CallHistoryEntry,
  ChatGroup,
  CreateGroupPayload,
  UpdateGroupPayload,
  ContactProfile,
} from "frontend-common";
export { GENERAL_ROOM } from "frontend-common";

export const fetchMessages = async (room: string): Promise<ChatMessage[]> => {
  const response = await apiClient.get<{ messages: ChatMessage[] }>(chatEndpoints.messages(room));
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to load messages", response.status);
  }
  return response.data.messages ?? [];
};

export const uploadFile = async (room: string, file: File, caption?: string): Promise<ChatMessage> => {
  const body = new FormData();
  body.append("file", file);
  if (caption) body.append("caption", caption);
  const response = await apiClient.postForm<ChatMessage>(chatEndpoints.files(room), body);
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to upload file", response.status);
  }
  return response.data;
};

export const downloadFile = async (room: string, fileId: string): Promise<Blob> => {
  const response = await apiClient.getBlob(chatEndpoints.file(room, fileId));
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to download file", response.status);
  }
  return response.data;
};

export const fileDownloadUrl = (room: string, fileId: string) => {
  const base = import.meta.env.VITE_API_URL ?? "/api";
  return `${base}${chatEndpoints.file(room, fileId)}`;
};

export const fetchIceServers = async (): Promise<{ iceServers: RTCIceServer[] }> => {
  const response = await apiClient.get<{ iceServers: RTCIceServer[] }>(chatEndpoints.webrtcConfig());
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to load WebRTC config", response.status);
  }
  return response.data;
};

export const fetchCallHistory = async (peer?: string): Promise<CallHistoryEntry[]> => {
  const response = await apiClient.get<{ calls: CallHistoryEntry[] }>(
    chatEndpoints.callHistory(),
    peer ? { peer } : undefined,
  );
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to load call history", response.status);
  }
  return response.data.calls ?? [];
};

export const deleteMessage = async (room: string, messageId: string): Promise<void> => {
  const response = await apiClient.delete<null>(`${chatEndpoints.messages(room)}/${messageId}`);
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to delete message", response.status);
  }
};

export const fetchGroups = async (): Promise<ChatGroup[]> => {
  const response = await apiClient.get<{ groups: ChatGroup[] }>(chatEndpoints.groups());
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to load groups", response.status);
  }
  return response.data.groups ?? [];
};

export const fetchContacts = async (): Promise<ContactProfile[]> => {
  const response = await apiClient.get<{ contacts: ContactProfile[] }>(chatEndpoints.contacts());
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to load contacts", response.status);
  }
  return response.data.contacts ?? [];
};

export const createGroup = async (payload: CreateGroupPayload): Promise<ChatGroup> => {
  const response = await apiClient.post<ChatGroup>(chatEndpoints.groups(), {
    name: payload.name,
    members: payload.members,
    description: payload.description ?? "",
  });
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to create group", response.status);
  }
  return response.data;
};

export const fetchGroup = async (groupId: string): Promise<ChatGroup> => {
  const response = await apiClient.get<ChatGroup>(chatEndpoints.group(groupId));
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to load group", response.status);
  }
  return response.data;
};

export const updateGroup = async (groupId: string, body: UpdateGroupPayload): Promise<ChatGroup> => {
  const response = await apiClient.patch<ChatGroup>(chatEndpoints.group(groupId), body);
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to update group", response.status);
  }
  return response.data;
};

export const uploadGroupPhoto = async (groupId: string, file: File): Promise<string> => {
  const body = new FormData();
  body.append("photo", file);
  const response = await apiClient.postForm<{ image: string }>(chatEndpoints.groupAvatar(groupId), body);
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to upload group photo", response.status);
  }
  return response.data.image;
};

export const removeGroupPhoto = async (groupId: string): Promise<void> => {
  const response = await apiClient.delete<null>(chatEndpoints.groupAvatar(groupId));
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to remove group photo", response.status);
  }
};

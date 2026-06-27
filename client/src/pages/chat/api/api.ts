import { api } from "@/lib/axios";

export type MessageFile = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
};

export type ChatMessage = {
  room: string;
  user: string;
  text: string;
  at: string;
  type?: "text" | "file";
  file?: MessageFile;
};

export type CallType = "audio" | "video";

export const GENERAL_ROOM = "general";

export async function fetchMessages(room: string) {
  const { data } = await api.get<{ messages: ChatMessage[] }>(`/rooms/${room}/messages`);
  return data.messages ?? [];
}

export async function uploadFile(room: string, file: File, caption?: string) {
  const body = new FormData();
  body.append("file", file);
  if (caption) body.append("caption", caption);
  const { data } = await api.post<ChatMessage>(`/rooms/${room}/files`, body, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function downloadFile(room: string, fileId: string) {
  const { data } = await api.get<Blob>(`/rooms/${room}/files/${fileId}`, { responseType: "blob" });
  return data;
}

export function fileDownloadUrl(room: string, fileId: string) {
  return `/api/rooms/${room}/files/${fileId}`;
}

export async function fetchIceServers() {
  const { data } = await api.get<{ iceServers: RTCIceServer[] }>("/webrtc/config");
  return data;
}

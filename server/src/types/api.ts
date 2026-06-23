export interface MessageFileDto {
  id: string;
  name: string;
  mimeType: string;
  size: number;
}

export type MessageType = "text" | "file";

export interface ChatMessageDto {
  user: string;
  text: string;
  type: MessageType;
  file?: MessageFileDto;
  at: string;
}

export interface MessagesResponse {
  messages: ChatMessageDto[];
}

export interface OkResponse {
  ok: true;
}

export interface ApiErrorResponse {
  error: string;
  details?: Record<string, string[] | undefined>;
}

export interface IceServerDto {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface WebRTCConfigResponse {
  iceServers: IceServerDto[];
}

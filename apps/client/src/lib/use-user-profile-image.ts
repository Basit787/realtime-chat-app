import { useChatStore } from "@/pages/chat/store/chat-store";

export const useUserProfileImage = (username: string) =>
  useChatStore((s) => s.userProfileImages[username]);

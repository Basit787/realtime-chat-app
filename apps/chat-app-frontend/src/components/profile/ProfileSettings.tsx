import type { ReactNode } from "react";
import { AccountSettings } from "frontend-common";
import { toastError, toastSuccess } from "@/lib/toast";
import { useChatStore } from "@/features/chat/store/chat-store";
import { queryClient } from "@/lib/query-client";
import { useAuthStore } from "@/lib/auth-store";

// Account details live in the shared auth service; photo changes refresh chat avatars
export const ProfileSettings = ({ children }: { children?: ReactNode }) => (
  <AccountSettings
    onSuccess={(message) => {
      toastSuccess(message);
      if (message === "Profile photo updated" || message === "Profile photo removed") {
        const { username, profileImage } = useAuthStore.getState();
        if (username) useChatStore.getState().mergeUserProfileImages({ [username]: profileImage });
        void queryClient.invalidateQueries({ queryKey: ["contacts"] });
      }
    }}
    onError={toastError}
  >
    {children}
  </AccountSettings>
);

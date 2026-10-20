import { AccountSettings } from "frontend-common";
import { toastError, toastSuccess } from "@/lib/toast";
import { useChatStore } from "@/features/chat/store/chat-store";
import { queryClient } from "@/lib/query-client";

// Account details live in the shared auth service; deleting the account also clears local chat state
export const ProfileSettings = () => (
  <AccountSettings
    onSuccess={(message) => {
      toastSuccess(message);
      if (message === "Account deleted") {
        useChatStore.getState().reset();
        queryClient.clear();
      }
    }}
    onError={toastError}
  />
);

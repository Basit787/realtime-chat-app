import { useCallback } from "react";
import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { updatePresenceStatus, type PresenceStatus } from "@/features/profile/api";
import { authClient } from "@/lib/auth";
import { useAuthStore } from "@/lib/auth-store";
import { useChatStore, type UserStatus } from "@/features/chat/store/chat-store";
import { useMutationToast } from "@/lib/use-mutation-toast";

export const useUploadProfileAvatar = () => {
  const mergeUserProfileImages = useChatStore((s) => s.mergeUserProfileImages);
  const queryClient = useQueryClient();
  const { onSuccessNotification, onErrorNotification } = useMutationToast();

  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("photo", file);
      return authClient.uploadAvatar(form);
    },
    onSuccess: () => {
      const { username, profileImage } = useAuthStore.getState();
      if (username) mergeUserProfileImages({ [username]: profileImage });
      void queryClient.invalidateQueries({ queryKey: ["contacts"] });
      onSuccessNotification("Profile photo updated");
    },
    onError: (err) => onErrorNotification(err, "Could not upload photo"),
  });
};

export const useRemoveProfileAvatar = () => {
  const mergeUserProfileImages = useChatStore((s) => s.mergeUserProfileImages);
  const { onSuccessNotification, onErrorNotification } = useMutationToast();

  return useMutation({
    mutationFn: () => authClient.removeAvatar(),
    onSuccess: () => {
      const username = useAuthStore.getState().username;
      if (username) mergeUserProfileImages({ [username]: "" });
      onSuccessNotification("Profile photo removed");
    },
    onError: (err) => onErrorNotification(err, "Could not remove photo"),
  });
};

export const useUpdatePresenceStatus = (): UseMutationResult<PresenceStatus, Error, UserStatus> => {
  const username = useAuthStore((s) => s.username);
  const mergeUserStatuses = useChatStore((s) => s.mergeUserStatuses);
  const setUserStatus = useChatStore((s) => s.setUserStatus);
  const { onErrorNotification } = useMutationToast();

  return useMutation({
    mutationFn: (status: UserStatus) => updatePresenceStatus(status),
    onMutate: (status) => {
      mergeUserStatuses({ [username]: status });
      setUserStatus(status);
    },
    onError: (err) => onErrorNotification(err, "Could not update status"),
  });
};

export const usePresenceStatus = () => {
  const username = useAuthStore((s) => s.username);
  const userStatuses = useChatStore((s) => s.userStatuses);
  const userStatus = useChatStore((s) => s.userStatuses[username] ?? s.userStatus);
  const updateStatus = useUpdatePresenceStatus();

  const changeStatus = useCallback(
    (status: UserStatus) => {
      updateStatus.mutate(status);
    },
    [updateStatus],
  );

  return { userStatus, userStatuses, changeStatus, isUpdating: updateStatus.isPending };
};

export const useProfile = () => {
  return {
    uploadAvatar: useUploadProfileAvatar(),
    deleteAvatar: useRemoveProfileAvatar(),
  };
};

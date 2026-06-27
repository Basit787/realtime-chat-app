import { useCallback } from "react";
import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import {
  changeEmail,
  changePassword,
  deleteAccount,
  fetchSession,
  removeProfilePhoto,
  updatePresenceStatus,
  updateProfile,
  uploadProfilePhoto,
  type PresenceStatus,
} from "@/pages/auth/api/api";
import { useAuthStore } from "@/pages/auth/store/auth-store";
import { useChatStore, type UserStatus } from "@/pages/chat/store/chat-store";
import { useMutationToast } from "@/lib/use-mutation-toast";

export const useUpdateProfileName = () => {
  const token = useAuthStore((s) => s.token);
  const setSession = useAuthStore((s) => s.setSession);
  const queryClient = useQueryClient();
  const { onSuccessNotification, onErrorNotification } = useMutationToast();

  return useMutation({
    mutationFn: (name: string) => updateProfile(name),
    onSuccess: (user) => {
      setSession(user.name, token, user.email, user.image ?? "");
      void queryClient.invalidateQueries({ queryKey: ["session"] });
      onSuccessNotification("Profile updated");
    },
    onError: (err) => onErrorNotification(err, "Could not update profile"),
  });
};

export const useUpdateEmail = () => {
  const token = useAuthStore((s) => s.token);
  const setSession = useAuthStore((s) => s.setSession);
  const queryClient = useQueryClient();
  const { onSuccessNotification, onErrorNotification } = useMutationToast();

  return useMutation({
    mutationFn: (newEmail: string) => changeEmail(newEmail),
    onSuccess: async () => {
      const user = await fetchSession();
      if (user) setSession(user.name, token, user.email, user.image ?? "");
      void queryClient.invalidateQueries({ queryKey: ["session"] });
      onSuccessNotification("Email updated");
    },
    onError: (err) => onErrorNotification(err, "Could not update email"),
  });
};

export const useUpdatePassword = () => {
  const { onSuccessNotification, onErrorNotification } = useMutationToast();

  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      changePassword(currentPassword, newPassword),
    onSuccess: () => onSuccessNotification("Password changed"),
    onError: (err) => onErrorNotification(err, "Could not change password"),
  });
};

export const useDeleteAccount = () => {
  const clearSession = useAuthStore((s) => s.clearSession);
  const resetChat = useChatStore((s) => s.reset);
  const queryClient = useQueryClient();
  const { onSuccessNotification, onErrorNotification } = useMutationToast();

  return useMutation({
    mutationFn: (password: string) => deleteAccount(password),
    onSuccess: () => {
      clearSession();
      resetChat();
      void queryClient.clear();
      onSuccessNotification("Account deleted");
    },
    onError: (err) => onErrorNotification(err, "Could not delete account"),
  });
};

export const useUploadProfileAvatar = () => {
  const setProfileImage = useAuthStore((s) => s.setProfileImage);
  const queryClient = useQueryClient();
  const { onSuccessNotification, onErrorNotification } = useMutationToast();

  return useMutation({
    mutationFn: (file: File) => uploadProfilePhoto(file),
    onSuccess: (image) => {
      setProfileImage(image);
      void queryClient.invalidateQueries({ queryKey: ["session"] });
      onSuccessNotification("Profile photo updated");
    },
    onError: (err) => onErrorNotification(err, "Could not upload photo"),
  });
};

export const useRemoveProfileAvatar = () => {
  const setProfileImage = useAuthStore((s) => s.setProfileImage);
  const queryClient = useQueryClient();
  const { onSuccessNotification, onErrorNotification } = useMutationToast();

  return useMutation({
    mutationFn: () => removeProfilePhoto(),
    onSuccess: () => {
      setProfileImage("");
      void queryClient.invalidateQueries({ queryKey: ["session"] });
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
    updateName: useUpdateProfileName(),
    updateEmail: useUpdateEmail(),
    updatePassword: useUpdatePassword(),
    removeAccount: useDeleteAccount(),
    uploadAvatar: useUploadProfileAvatar(),
    deleteAvatar: useRemoveProfileAvatar(),
  };
};

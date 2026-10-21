import { useMutation } from "@tanstack/react-query";
import { useNotification } from "my-ui";
import { deleteAccount } from "../api/delete-account";
import { useAuth } from "./use-auth";

// Account deletion with its own toasts; success signs out, so AuthGate shows the login screen
export const useDeleteAccount = () => {
  const { client } = useAuth();
  const { showSuccessNotification, showErrorNotification } = useNotification();
  return useMutation({
    mutationFn: (password: string) => deleteAccount(client, password),
    onSuccess: () => showSuccessNotification("Account deleted"),
    onError: (error) => showErrorNotification(error, "Could not delete account"),
  });
};

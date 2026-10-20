import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotification } from "pui";
import { createLink } from "@/lib/client/api/create-link";
import { linkQueryKeys } from "@/lib/client/query-keys";
import type { CreateLinkInput } from "@/lib/types/create-link-input";

export const useCreateLink = () => {
  const queryClient = useQueryClient();
  const { showSuccessNotification, showErrorNotification } = useNotification();
  return useMutation({
    mutationFn: (input: CreateLinkInput) => createLink(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: linkQueryKeys.all });
      showSuccessNotification("Short link created");
    },
    onError: (error) => showErrorNotification(error, "Could not create the link"),
  });
};

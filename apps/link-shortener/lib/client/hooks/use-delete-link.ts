import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotification } from "pui";
import { deleteLink } from "@/lib/client/api/delete-link";
import { linkQueryKeys } from "@/lib/client/query-keys";

export const useDeleteLink = () => {
  const queryClient = useQueryClient();
  const { showSuccessNotification, showErrorNotification } = useNotification();
  return useMutation({
    mutationFn: (id: string) => deleteLink(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: linkQueryKeys.all });
      showSuccessNotification("Link deleted");
    },
    onError: (error) => showErrorNotification(error, "Could not delete the link"),
  });
};

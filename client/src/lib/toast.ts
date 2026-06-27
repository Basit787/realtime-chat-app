import axios from "axios";
import { toast } from "sonner";

export function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (typeof data?.message === "string") return data.message;
    return error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export function toastSuccess(message: string) {
  toast.success(message);
}

export function toastError(error: unknown, fallback: string) {
  toast.error(getErrorMessage(error, fallback));
}

// `cn` lives in the shared design system so app code and @chat/ui components merge classes the same way
export { cn } from "@chat/ui";

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "";

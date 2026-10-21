import { ApiError } from "@/server/http/api-error";
import type { AuthUser } from "@/types/auth-user";
import { getUser } from "./get-user";

// The signed-in user, or a 401
export async function requireUser(request: Request): Promise<AuthUser> {
  const user = await getUser(request);
  if (!user) throw new ApiError(401, "Authentication required");
  return user;
}

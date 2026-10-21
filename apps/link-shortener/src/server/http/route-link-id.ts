import { linkIdSchema } from "@/validation/link-id-schema";
import { ApiError } from "./api-error";

// The [id] route param, or a 404 when it cannot be a link id
export async function routeLinkId(params: Promise<{ id: string }>): Promise<string> {
  const { id } = await params;
  if (!linkIdSchema.safeParse(id).success) throw new ApiError(404, "Link not found");
  return id;
}

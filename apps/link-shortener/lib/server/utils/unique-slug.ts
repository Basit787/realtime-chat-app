import { linkRepository } from "@/lib/db/link-repository";
import { ApiError } from "@/lib/server/http/api-error";
import { randomSlug } from "./random-slug";

// The requested slug if it is free (409 otherwise), or a fresh random one
export async function uniqueSlug(requested?: string): Promise<string> {
  if (requested) {
    if (await linkRepository.slugExists(requested)) throw new ApiError(409, "That short link is already taken");
    return requested;
  }
  for (;;) {
    const slug = randomSlug();
    if (!(await linkRepository.slugExists(slug))) return slug;
  }
}

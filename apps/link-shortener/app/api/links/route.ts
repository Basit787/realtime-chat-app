import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/server/auth/require-user";
import { handle } from "@/lib/server/http/handle";
import { parseBody } from "@/lib/server/http/parse-body";
import { linkService } from "@/lib/server/link-service";
import { createLinkSchema } from "@/lib/validation/create-link-schema";

// The signed-in user's links, newest first
export function GET(request: NextRequest) {
  return handle(async () => {
    const user = await requireUser(request);
    return Response.json({ links: await linkService.list(user.id) });
  });
}

export function POST(request: NextRequest) {
  return handle(async () => {
    const user = await requireUser(request);
    const input = await parseBody(request, createLinkSchema);
    return Response.json(await linkService.create(user.id, input), { status: 201 });
  });
}

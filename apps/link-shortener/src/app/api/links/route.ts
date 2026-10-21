import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { handle } from "@/server/http/handle";
import { parseBody } from "@/server/http/parse-body";
import { linkService } from "@/server/link-service";
import { createLinkSchema } from "@/validation/create-link-schema";

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

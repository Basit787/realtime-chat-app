import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { handle } from "@/server/http/handle";
import { parseBody } from "@/server/http/parse-body";
import { routeLinkId } from "@/server/http/route-link-id";
import { linkService } from "@/server/link-service";
import { updateLinkSchema } from "@/validation/update-link-schema";

export function GET(request: NextRequest, ctx: RouteContext<"/api/links/[id]">) {
  return handle(async () => {
    const user = await requireUser(request);
    return Response.json(await linkService.get(await routeLinkId(ctx.params), user.id));
  });
}

export function PATCH(request: NextRequest, ctx: RouteContext<"/api/links/[id]">) {
  return handle(async () => {
    const user = await requireUser(request);
    const input = await parseBody(request, updateLinkSchema);
    return Response.json(await linkService.update(await routeLinkId(ctx.params), user.id, input));
  });
}

export function DELETE(request: NextRequest, ctx: RouteContext<"/api/links/[id]">) {
  return handle(async () => {
    const user = await requireUser(request);
    await linkService.remove(await routeLinkId(ctx.params), user.id);
    return Response.json({ ok: true });
  });
}

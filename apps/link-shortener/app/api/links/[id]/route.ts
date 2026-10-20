import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/server/auth/require-user";
import { handle } from "@/lib/server/http/handle";
import { parseBody } from "@/lib/server/http/parse-body";
import { routeLinkId } from "@/lib/server/http/route-link-id";
import { linkService } from "@/lib/server/link-service";
import { updateLinkSchema } from "@/lib/validation/update-link-schema";

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

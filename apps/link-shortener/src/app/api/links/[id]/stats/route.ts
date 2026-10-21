import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { routeLinkId } from "@/server/http/route-link-id";
import { handle } from "@/server/http/handle";
import { linkService } from "@/server/link-service";

// Clicks per day for the last 30 days
export function GET(request: NextRequest, ctx: RouteContext<"/api/links/[id]/stats">) {
  return handle(async () => {
    const user = await requireUser(request);
    return Response.json(await linkService.stats(await routeLinkId(ctx.params), user.id));
  });
}

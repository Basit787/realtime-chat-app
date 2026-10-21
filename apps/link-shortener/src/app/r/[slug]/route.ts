import type { NextRequest } from "next/server";
import { errorResponse } from "@/server/http/error-response";
import { linkService } from "@/server/link-service";

// The short link itself: 302 to the target URL and one click recorded
export async function GET(request: NextRequest, ctx: RouteContext<"/r/[slug]">) {
  const { slug } = await ctx.params;
  const url = await linkService.resolve(slug, request.headers.get("referer"), request.headers.get("user-agent"));
  if (!url) return errorResponse(404, "This link does not exist or has expired");
  return Response.redirect(url, 302);
}

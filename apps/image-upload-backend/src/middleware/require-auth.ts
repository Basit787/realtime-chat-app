import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { getUser } from "../lib/auth/get-user.js";
import type { AppEnv } from "../types/app-env.js";

// Every route behind it needs a valid bearer token; the user lands in `c.var.user`
export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const user = await getUser(c.req.header("authorization"));
  if (!user) throw new HTTPException(401, { message: "Authentication required" });
  c.set("user", user);
  await next();
});

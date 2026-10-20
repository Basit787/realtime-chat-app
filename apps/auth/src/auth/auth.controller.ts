import { appConfig, type AppConfig } from "@app/common";
import { All, Controller, Inject, Req, Res } from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";
import type { IncomingMessage, ServerResponse } from "node:http";
import { AUTH, type AppAuth } from "./auth.factory.js";

type AuthRequest = IncomingMessage & { body?: unknown; originalUrl?: string };

const WITHOUT_BODY = new Set(["GET", "HEAD"]);

// Hands every /api/auth/* request to better-auth (sign-in, sign-up, sessions, profile updates) as a fetch Request
@ApiExcludeController()
@Controller("auth")
export class AuthController {
  constructor(
    @Inject(AUTH) private readonly auth: AppAuth,
    @Inject(appConfig.KEY) private readonly config: AppConfig,
  ) {}

  @All("*path")
  async handle(@Req() req: AuthRequest, @Res() res: ServerResponse) {
    const response = await this.auth.handler(this.toFetchRequest(req));
    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      if (key !== "set-cookie") res.setHeader(key, value);
    });
    const cookies = response.headers.getSetCookie();
    if (cookies.length > 0) res.setHeader("set-cookie", cookies);
    res.end(Buffer.from(await response.arrayBuffer()));
  }

  private toFetchRequest(req: AuthRequest): Request {
    const method = req.method ?? "GET";
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(", ") : value);
    }
    // Nest already parsed the JSON body, so it is re-serialized and its length recomputed
    headers.delete("content-length");
    const body = WITHOUT_BODY.has(method) || req.body === undefined ? undefined : JSON.stringify(req.body);
    return new Request(new URL(req.originalUrl ?? req.url ?? "/", this.config.publicUrl), {
      method,
      headers,
      body,
    });
  }
}

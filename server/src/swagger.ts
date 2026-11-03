import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule, type OpenAPIObject } from "@nestjs/swagger";

const credentials = (required: string[], extra: Record<string, object> = {}) => ({
  required: true,
  content: {
    "application/json": {
      schema: {
        type: "object",
        required,
        properties: {
          email: { type: "string", format: "email", example: "user@example.com" },
          password: { type: "string", minLength: 8, example: "password123" },
          ...extra,
        },
      },
    },
  },
});

// better-auth serves /api/auth/* itself, so its main routes are described by hand
const authPaths: OpenAPIObject["paths"] = {
  "/api/auth/sign-up/email": {
    post: {
      tags: ["Auth"],
      summary: "Register with email and password",
      requestBody: credentials(["email", "password", "name"], { name: { type: "string", example: "alex" } }),
      responses: { "200": { description: "Signed up; the session token is in the set-auth-token header" } },
    },
  },
  "/api/auth/sign-in/email": {
    post: {
      tags: ["Auth"],
      summary: "Sign in with email and password",
      requestBody: credentials(["email", "password"]),
      responses: { "200": { description: "Signed in; the session token is in the set-auth-token header" } },
    },
  },
  "/api/auth/sign-out": {
    post: {
      tags: ["Auth"],
      summary: "Sign out (revokes the session)",
      security: [{ bearer: [] }],
      responses: { "200": { description: "Signed out" } },
    },
  },
};

// Swagger UI at /api/docs and the JSON spec at /api/docs/openapi.json, generated from the controllers and DTOs
export const setupSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle("Realtime Chat API")
    .setVersion("1.0.0")
    .setDescription(
      [
        "HTTP API for the realtime chat application.",
        "",
        "**Authentication:** sign in under `/api/auth/*` to get a session token (`set-auth-token`), exchange it at `POST /api/token` for a short-lived access token, and send that as `Authorization: Bearer <token>`.",
        "",
        "**Real-time:** messages, typing, presence and WebRTC signaling use Socket.IO with `auth.token`.",
      ].join("\n"),
    )
    .addBearerAuth()
    .addTag("Auth", "Better Auth email/password (subset of /api/auth/*)")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  document.paths = { ...authPaths, ...document.paths };
  SwaggerModule.setup("api/docs", app, document, {
    jsonDocumentUrl: "api/docs/openapi.json",
    customSiteTitle: "Realtime Chat API",
  });
};

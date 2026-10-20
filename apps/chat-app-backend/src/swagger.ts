import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

// Swagger UI at /docs and the JSON spec at /docs/openapi.json, generated from the controllers and DTOs
export const setupSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle("Realtime Chat API")
    .setVersion("1.0.0")
    .setDescription(
      [
        "HTTP API for the realtime chat application.",
        "",
        "**Authentication:** most endpoints need an access token from the auth service (`POST /api/token` on apps/auth), sent as `Authorization: Bearer <token>`.",
        "",
        "**Real-time:** messages, typing, presence and WebRTC signaling use Socket.IO with `auth.token`.",
      ].join("\n"),
    )
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document, {
    jsonDocumentUrl: "docs/openapi.json",
    customSiteTitle: "Realtime Chat API",
  });
};

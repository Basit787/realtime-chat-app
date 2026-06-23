export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Realtime Chat API",
    version: "1.0.0",
    description: [
      "HTTP API for the realtime chat application.",
      "",
      "**Authentication:** Most endpoints require a Bearer token from Better Auth (`Authorization: Bearer <token>`).",
      "Sign-in responses include a `set-auth-token` response header with the token.",
      "",
      "**Real-time:** Chat messages, typing, presence, and WebRTC signaling use **Socket.io** (not covered in full here).",
      "Connect with `auth.token` and `query.room` (e.g. `general`).",
    ].join("\n"),
  },
  servers: [{ url: "http://localhost:3004", description: "Local development" }],
  tags: [
    { name: "Health", description: "Service health checks" },
    { name: "Auth", description: "Better Auth email/password (subset of `/auth/*` routes)" },
    { name: "Messages", description: "Room message history" },
    { name: "Files", description: "File upload and download" },
    { name: "WebRTC", description: "ICE server configuration for calls" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Bearer token from Better Auth sign-in (`set-auth-token` header)",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: { type: "string", example: "Authentication required" },
          details: { type: "object", additionalProperties: true },
        },
      },
      HealthResponse: {
        type: "object",
        properties: { ok: { type: "boolean", example: true } },
      },
      AuthUser: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string", example: "alex" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: ["user", "admin"] },
        },
      },
      SignUpRequest: {
        type: "object",
        required: ["email", "password", "name"],
        properties: {
          email: { type: "string", format: "email", example: "user@example.com" },
          password: { type: "string", minLength: 8, example: "password123" },
          name: { type: "string", minLength: 2, maxLength: 32, example: "alex" },
        },
      },
      SignInRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "user@example.com" },
          password: { type: "string", example: "password123" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/AuthUser" },
          token: { type: "string", description: "Also returned via `set-auth-token` response header" },
        },
      },
      MessageFile: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string", example: "document.pdf" },
          mimeType: { type: "string", example: "application/pdf" },
          size: { type: "integer", example: 102400 },
        },
      },
      ChatMessage: {
        type: "object",
        properties: {
          user: { type: "string", example: "alex" },
          text: { type: "string", example: "Hello!" },
          type: { type: "string", enum: ["text", "file"], default: "text" },
          file: { $ref: "#/components/schemas/MessageFile" },
          at: { type: "string", format: "date-time" },
        },
      },
      MessagesResponse: {
        type: "object",
        properties: {
          messages: {
            type: "array",
            items: { $ref: "#/components/schemas/ChatMessage" },
          },
        },
      },
      IceServer: {
        type: "object",
        properties: {
          urls: { type: "string", example: "stun:localhost:3478" },
          username: { type: "string" },
          credential: { type: "string" },
        },
      },
      WebRTCConfigResponse: {
        type: "object",
        properties: {
          iceServers: {
            type: "array",
            items: { $ref: "#/components/schemas/IceServer" },
          },
        },
      },
      OkResponse: {
        type: "object",
        properties: { ok: { type: "boolean", example: true } },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          "200": {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/sign-up/email": {
      post: {
        tags: ["Auth"],
        summary: "Register with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignUpRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "User created; token in `set-auth-token` header",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "400": {
            description: "Validation error or email already exists",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/auth/sign-in/email": {
      post: {
        tags: ["Auth"],
        summary: "Sign in with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignInRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Signed in; token in `set-auth-token` header",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "401": {
            description: "Invalid credentials",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/auth/sign-out": {
      post: {
        tags: ["Auth"],
        summary: "Sign out current session",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Signed out" },
          "401": {
            description: "Not authenticated",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/rooms/{room}/messages": {
      get: {
        tags: ["Messages"],
        summary: "Get room message history",
        description: "Returns up to 200 messages sorted oldest-first.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "room",
            in: "path",
            required: true,
            schema: { type: "string", minLength: 1, maxLength: 64, example: "general" },
          },
        ],
        responses: {
          "200": {
            description: "Message list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessagesResponse" },
              },
            },
          },
          "401": {
            description: "Not authenticated",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/rooms/{room}/messages/{id}": {
      delete: {
        tags: ["Messages"],
        summary: "Delete a message (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "room",
            in: "path",
            required: true,
            schema: { type: "string", example: "general" },
          },
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Message deleted; clients receive `message_deleted` via Socket.io",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OkResponse" },
              },
            },
          },
          "401": {
            description: "Not authenticated",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          "403": {
            description: "Admin role required",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/rooms/{room}/files": {
      post: {
        tags: ["Files"],
        summary: "Upload a file to a room",
        description: "Max file size defaults to 25 MB. Broadcasts a file message via Socket.io.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "room",
            in: "path",
            required: true,
            schema: { type: "string", example: "general" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file"],
                properties: {
                  file: { type: "string", format: "binary" },
                  caption: { type: "string", description: "Optional caption" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "File uploaded",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ChatMessage" },
              },
            },
          },
          "400": {
            description: "No file uploaded",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          "401": {
            description: "Not authenticated",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/rooms/{room}/files/{id}": {
      get: {
        tags: ["Files"],
        summary: "Download a shared file",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "room",
            in: "path",
            required: true,
            schema: { type: "string", example: "general" },
          },
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "File binary stream",
            content: { "application/octet-stream": { schema: { type: "string", format: "binary" } } },
          },
          "401": {
            description: "Not authenticated",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          "404": {
            description: "File not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/webrtc/config": {
      get: {
        tags: ["WebRTC"],
        summary: "Get ICE server configuration",
        description: "STUN/TURN servers for WebRTC peer connections.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "ICE servers",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/WebRTCConfigResponse" },
              },
            },
          },
          "401": {
            description: "Not authenticated",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
  },
} as const;

# Real-Time Chat Application

**Socket.io** + **Express** + **React** with **Mongoose/MongoDB**, real-time chat, **private DMs**, **audio/video calls** (WebRTC), and **file sharing** — all via Docker.

## Start (Docker)

```bash
make
```

Or:

```bash
./up.sh
```

| Service | URL / Port |
|---------|------------|
| **UI** | http://localhost:5176 |
| **API** (direct) | http://localhost:3004 |
| **MongoDB** | localhost:27018 |
| **MinIO API** | http://localhost:9000 |
| **MinIO Console** | http://localhost:9001 (login: minioadmin / minioadmin) |
| **TURN/STUN** (coturn) | localhost:3478 |

Copy `apps/server/.env.example` to `apps/server/.env` (and `apps/client/.env.example` to `apps/client/.env`) to customize secrets and TURN settings; compose reads each app's `.env` from its own folder.

## Development (live reload)

`make` / `./up.sh` starts Docker with **hot reload** — edit `apps/client/src` or `apps/server/src` and changes apply without restarting containers.

- **Client:** Vite dev server + HMR on port 5176
- **Server:** `tsx watch` restarts on file changes

## Monorepo

pnpm workspaces + [Turborepo](https://turborepo.com):

```text
apps/client              React + Vite app (@chat/client)
apps/server              Express + Socket.IO API (@chat/server)
packages/ui              design system: Tailwind theme/styles + UI primitives, built to dist/ (@chat/ui)
packages/frontend-common shared React hooks and helpers
packages/backend-common  shared Express helpers: errors, async handler, validation, S3/MinIO storage + uploads
packages/eslint-config   shared ESLint presets (base / react / node)
packages/prettier-config shared Prettier config
packages/tsconfig        shared TypeScript presets
docker/Dockerfile        the one image definition for every app (APP build arg, dev/prod targets)
```

Each app owns its compose files and `.env` (`apps/<app>/docker-compose.{dev,prod}.yml`, `apps/<app>/.env.example`); the server's also start MongoDB, MinIO and coturn. The root `docker-compose.dev.yml` / `docker-compose.prod.yml` just `include` them.


All dependency versions are declared once in the root `pnpm-workspace.yaml` catalog; packages reference them with `"catalog:"`.

```bash
npx -y pnpm@10.12.1 install                    # or `pnpm install` if pnpm is installed
npx -y pnpm@10.12.1 turbo run build            # builds packages, then apps
npx -y pnpm@10.12.1 turbo run typecheck lint
```

If you add npm dependencies, rebuild app images:

```bash
make rebuild
```

For a production-style build (static client, compiled server):

```bash
make prod
```

## Default admin

On first startup the server seeds an admin user:

- Email: `admin@chat.local`
- Password: `Admin123!`

Override with `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` in `.env`.

## App flow

### 1. Auth
Register or sign in at http://localhost:5176 → bearer token stored → socket connects.

### 2. General channel (`#general`)
- Public room — all online users see the same messages.
- Messages persist in MongoDB under room `general`.

### 3. Direct messages (DM)
- Click an online user in the sidebar (or start chatting with someone from message history).
- Messages go to a **private room** `dm..userA..userB` (sorted usernames).
- Only the two participants can read/send in that room.
- Socket auto-joins the DM room when you open the conversation.

### 4. Audio / video calls
- Open a **DM** conversation (not `#general`).
- Use phone / video buttons in the chat header.
- Flow: invite → callee accepts → WebRTC offer/answer via Socket.io → media via P2P + coturn TURN.
- Calls work across users regardless of which room they are viewing.

### 5. File sharing
- Attach files in any conversation (general or DM).
- Files, profile photos, and group images are stored in **MinIO** (S3-compatible object storage).

## Architecture

```
Browser (5176)
  ├─ /api/*     → Vite proxy → server:3004
  └─ /socket.io → Vite proxy → server:3004 (WebSocket)

server:3004
  ├─ better-auth  /auth/*
  ├─ REST         /rooms/:room/messages, /rooms/:room/files
  ├─ Socket.io    message, typing, presence, call:*
  ├─ MongoDB      mongo:27017
  └─ MinIO        minio:9000 (bucket: chat-uploads)

coturn:3478       STUN/TURN for WebRTC
minio:9000        Object storage (files, avatars, group images)
minio:9001        MinIO web console
```

`MINIO_ENDPOINT` is **required**. Chat attachments, profile photos, and group images are stored only in MinIO (MongoDB keeps metadata and references).

## WebRTC / TURN

Calls use the **coturn** container. For local Docker, `TURN_HOST=localhost` works from the browser.

On a remote server set in `.env`:

- `TURN_EXTERNAL_IP` — your public IP
- `TURN_HOST` — hostname browsers can reach

## Local dev (without Docker)

```bash
pnpm install
pnpm turbo run dev   # watches the packages and runs the server and client together
```

The server needs MongoDB and MinIO running (for example the `mongo` and `minio` services from `docker-compose.dev.yml`).

Client dev server: http://localhost:5176 (proxies API to port 3004).

MIT

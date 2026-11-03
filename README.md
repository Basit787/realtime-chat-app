# Real-Time Chat Application

**NestJS + Socket.IO** server and **React + Vite** client with **Prisma/MongoDB**: real-time chat, **private DMs**, **groups**, **audio/video calls** (WebRTC) and **file sharing**.

```text
client/   React + Vite + TanStack Router app (src/ui: design system, src/common: auth, API client, chat helpers)
server/   NestJS API + Socket.IO (src: features, libs: auth, common, db, notifications, realtime, storage)
  prisma/   schema.prisma (MongoDB data model) and seed.mjs
docker-compose.yml   the whole stack (live reload)
Makefile             every command below
```

The two apps are independent pnpm projects, each with its own `package.json`, lockfile and `Dockerfile` (stages `dev` and `prod`).

## Start (Docker)

```bash
cp .env.example .env   # optional: every value has a default
make                   # the whole stack with live reload (same as `make up`)
docker compose exec server pnpm db:seed   # admin account + a welcome message in #general
```

| Service | URL / Port |
|---------|------------|
| **Client** | http://localhost:3000 |
| **API** (direct) | http://localhost:3001/api |
| **API docs** (Swagger) | http://localhost:3001/api/docs |
| **MongoDB** (replica set `rs0`) | localhost:27018 |
| **MinIO API** | http://localhost:9000 |
| **MinIO Console** | http://localhost:9001 (minioadmin / minioadmin) |
| **TURN/STUN** (coturn) | localhost:3478 |

| Command | What it does |
|---------|--------------|
| `make` / `make up` | Build and start everything in the background; edits in `client/src`, `server/src`, `server/libs` reload live |
| `make down` | Stop everything |
| `make install` | `pnpm install` in `server/` and `client/` (also generates the Prisma client) |
| `make clean` | Delete `node_modules` and build output in both apps |

Everything else is plain Docker Compose, e.g. `docker compose logs -f server client`, `docker compose exec server sh`,
or `docker compose up --build --watch` to rebuild images by themselves when a lockfile, the Prisma schema or a Dockerfile changes.

## Default admin

`pnpm db:seed` in `server/` (runs `prisma/seed.mjs`; in Docker: `docker compose exec server pnpm db:seed`) creates an admin if it is missing:

- Email: `admin@chat.local`
- Password: `Admin123!`

Override with `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`.

## Database (Prisma + MongoDB)

The data model is `server/prisma/schema.prisma`; the server queries it only through the repositories in `server/libs/db`. MongoDB has no migrations: `prisma db push` creates the indexes, and the server container runs it on every start.

Prisma needs MongoDB transactions, so Mongo runs as a single-node replica set. Connect from your machine with `directConnection=true`, e.g. `mongodb://127.0.0.1:27018/realtime_chat?directConnection=true`.

After editing the schema: `pnpm prisma generate` in `server/` (in Docker, `make up` rebuilds the image). `pnpm db:reset` deletes every message and file record.

## Local development (without Docker for the apps)

```bash
make install                                    # pnpm install in server/ and client/
docker compose up -d mongo minio minio-init coturn   # only the infrastructure in Docker
cp server/.env.example server/.env              # then export it: set -a; . server/.env; set +a
cd server && pnpm exec prisma db push && pnpm dev   # http://localhost:3001
cd client && pnpm dev                           # http://localhost:3000, proxies /api and /socket.io to the server
```

## Architecture

```text
Browser (3000)
  ├─ /api/*      → Vite proxy → server:3001/api/*
  └─ /socket.io  → Vite proxy → server:3001 (WebSocket)

server:3001
  ├─ better-auth   /api/auth/*  (email/password sign-in, sessions; Prisma adapter)
  ├─ tokens        POST /api/token: session → short-lived access token (EdDSA JWT), refresh-token cookie
  ├─ REST          /api/rooms/:room/messages, /api/rooms/:room/files, /api/groups, /api/contacts, …
  ├─ Socket.IO     message, typing, presence, call:*, group-call:*
  ├─ MongoDB       mongo:27017 via Prisma
  └─ MinIO         minio:9000 (bucket: chat-uploads): attachments, avatars, group images

coturn:3478      STUN/TURN for WebRTC
```

Every HTTP route has an access token check unless it is public; sign-in, token and account routes use the better-auth session instead.

## App flow

1. **Auth**: register or sign in at http://localhost:3000; the client exchanges the session for an access token and opens the socket.
2. **#general**: public room; every online user sees the same messages.
3. **Direct messages**: click a user; messages go to a private room `dm..userA..userB`.
4. **Groups**: create a group with members, a name and an image.
5. **Calls**: phone / video buttons in a DM or group header; WebRTC signaling over Socket.IO, media P2P through coturn.
6. **Files**: attach files in any conversation; stored in MinIO.

## WebRTC / TURN

For local Docker, `TURN_HOST=localhost` works from the browser. On a remote server set `TURN_EXTERNAL_IP` (public IP) and `TURN_HOST` (a hostname browsers can reach) in `.env`.

## Legal pages

The sign-up terms checkbox, cookie banner and account settings link to terms, privacy and cookie pages at `VITE_LEGAL_URL` (`<url>/terms`, `/privacy`, `/cookies`). Set it in `.env` (Docker) or `client/.env`.

MIT

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
| **TURN/STUN** (coturn) | localhost:3478 |

Copy `.env.example` to `.env` to customize secrets and TURN settings.

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
- Files stored in Docker volume `uploads_data`.

## Architecture

```
Browser (5176)
  ├─ /api/*     → Vite proxy → server:3004
  └─ /socket.io → Vite proxy → server:3004 (WebSocket)

server:3004
  ├─ better-auth  /auth/*
  ├─ REST         /rooms/:room/messages, /rooms/:room/files
  ├─ Socket.io    message, typing, presence, call:*
  └─ MongoDB      mongo:27017

coturn:3478       STUN/TURN for WebRTC
```

## WebRTC / TURN

Calls use the **coturn** container. For local Docker, `TURN_HOST=localhost` works from the browser.

On a remote server set in `.env`:

- `TURN_EXTERNAL_IP` — your public IP
- `TURN_HOST` — hostname browsers can reach

## Local dev (without Docker)

```bash
# Terminal 1 — server
cd server && pnpm install && pnpm db:up && pnpm dev

# Terminal 2 — client
cd client && pnpm install && pnpm dev
```

Client dev server: http://localhost:5176 (proxies API to port 3004).

MIT

# Real-Time Chat Application

**Socket.io** + **Express** + **React** with **Mongoose/MongoDB**, real-time chat, **audio/video calls** (WebRTC), and **file sharing**.

## Start (Docker)

```bash
make
```

Or:

```bash
./up.sh
```

- UI: http://localhost:5176
- API: http://localhost:3004
- MongoDB: port 27018
- TURN/STUN (coturn): port 3478

## Features

- Register / login with JWT
- Real-time chat in `#general` room
- Typing indicators and online presence
- **Audio & video calls** between users in the same room (WebRTC + coturn)
- **File sharing** — upload files to the room (stored in Docker volume)

## WebRTC note

Calls use the **coturn** container for STUN/TURN. For local Docker, `TURN_HOST=localhost` works from the browser. On a remote server, set `TURN_EXTERNAL_IP` and `TURN_HOST` to your public IP/hostname.

MIT

# ER Connect

Anonymous peer-support chat for students, connecting them with trained senior Emotional Responders (ERs).

## Project Name

**ER Connect — Anonymous Emotional Support Chat for Students**

## Problem Statement

Students may need a private, approachable place to talk through academic or personal stress. They may hesitate to seek support if they fear being identified, judged, or unable to reach a peer responder quickly.

## Target Users

- **Students (clients):** Find an available senior responder and chat using an anonymous alias.
- **Emotional Responders (ERs):** Receive requests, manage availability, and support students through private chat sessions.
- **Administrators:** Manage ER accounts, review reported conversations, and monitor safety events.

## Solution

ER Connect provides role-based dashboards for students, responders, and administrators. Students can choose an available ER and request a chat. Once accepted, both participants can exchange real-time messages. Messages are encrypted at rest, and access to chat history is restricted to chat participants. Administrators can review a transcript only when it is associated with a user report; such access is audited.

## Key Features

- Anonymous aliases and role-specific views.
- ER availability, request acceptance or decline, and active chat management.
- Real-time chat using Socket.IO, with messages persisted for later history.
- AES-256-GCM encryption for stored messages.
- Crisis keyword detection with in-chat helpline information.
- Post-chat feedback and Bayesian weighted ER ratings.
- User reports and audited administrative transcript review.
- Participant authorization on chat and message routes.

## Tech Stack

| Area | Technologies |
|---|---|
| Frontend | React 18, Vite, React Router, Tailwind CSS, Axios, Socket.IO Client |
| Backend | Node.js, Express, Socket.IO, Mongoose, Zod |
| Database | MongoDB |
| Authentication and security | JWT in HTTP-only cookies, bcrypt, Helmet, CORS, AES-256-GCM |

## Architecture

```text
Browser (React)
  ├── REST requests (/api) ─────────────┐
  └── Socket.IO (/socket.io) ──────────┤
                                        ▼
                                Express + Socket.IO
                                 ├── Authentication and role guards
                                 ├── Chat and report controllers
                                 ├── Real-time participant notifications
                                 └── Message encryption/decryption
                                        │
                                        ▼
                                     MongoDB
```

The client uses REST for account, dashboard, chat history, and message persistence. Socket.IO sends request, acceptance, typing, crisis, end-of-chat, and new-message events. The server authenticates sockets from the HTTP-only session cookie and routes messages to the two chat participants. Message ciphertext, IV, and authentication tag are stored in a separate `Message` collection. The browser receives decrypted message text only after server-side authorization.

The repository is organized into `client/` for the Vite application and `server/` for the Express API, Socket.IO server, MongoDB models, and supporting services.

## Local Setup

### Requirements

- Node.js 18 or later
- npm
- A MongoDB database, such as a local MongoDB instance or MongoDB Atlas

### 1. Configure the server

```bash
cd server
npm install
cp .env.example .env
npm run generate-key
```

Put the generated `CHAT_KEY` into `server/.env`, and set `MONGO_URI` to your MongoDB connection string. The provided local configuration uses port `5001`, matching the Vite development proxy.

### 2. Start the backend

In a terminal from the `server/` directory:

```bash
npm run dev
```

The API and Socket.IO server run on `http://localhost:5001` by default.

### 3. Start the frontend

In another terminal:

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies `/api` and `/socket.io` to the backend on port `5001`. Restart Vite after changing `vite.config.js`.

### Optional: seed development accounts

```bash
cd server
npm run seed
```

Set `SEED_PASSWORD` in `server/.env` first; it becomes the password for the development accounts. **Warning:** The seed script deletes existing users, chats, messages, reports, and audit logs before creating development data. Run it only against a disposable database. It is not needed for a fresh student signup, but it creates initial ER and administrator accounts for local development.

## Environment Variables

Copy `server/.env.example` to `server/.env`. Keep `.env` out of version control and never put real credentials in the README or source code.

| Variable | Required | Purpose |
|---|---:|---|
| `PORT` | No | Backend port. Defaults to `5001` in the example; the server code defaults to `5000` if unset. |
| `MONGO_URI` | Yes | MongoDB connection string. |
| `JWT_SECRET` | Yes | Secret used to sign session tokens. Use a long, random value. |
| `CHAT_KEY` | Yes | 64-character hexadecimal key for AES-256-GCM. Generate with `npm run generate-key` from `server/`. |
| `CLIENT_URL` | Yes | Exact frontend origin allowed by backend CORS, such as `http://localhost:5173`. |
| `ALLOWED_EMAIL_DOMAIN` | No | Comma-separated allowed student email domains; defaults to `@sst.scaler.com`. |
| `MAX_CONCURRENT_CHATS_PER_ER` | No | Maximum concurrent chats per responder; defaults to `3`. |
| `SEED_PASSWORD` | Only when seeding | Password assigned to local development accounts. Choose a local-only value; do not reuse a production password. |
| `NODE_ENV` | No | Set to `production` for deployment; defaults to `development`. |

## Deployment

There is no public application URL configured in this repository yet. To deploy, use a MongoDB database and host the frontend and backend behind the **same HTTPS origin**. The application uses relative `/api` and `/socket.io` URLs and secure HTTP-only cookies in production.

1. Create a production MongoDB database and allow the backend host to connect to it.
2. Deploy the Node.js server on a host that supports persistent WebSocket connections. Configure `MONGO_URI`, a strong `JWT_SECRET`, a generated `CHAT_KEY`, `CLIENT_URL` (the frontend’s HTTPS origin), `ALLOWED_EMAIL_DOMAIN`, and `NODE_ENV=production`. Use the port supplied by the host when it provides one.
3. Build the frontend with `cd client && npm ci && npm run build` and publish the generated `client/dist` files.
4. Configure the frontend host or reverse proxy to serve the static frontend, forward `/api` requests to the Node server, and forward `/socket.io` with WebSocket upgrades enabled. Configure SPA fallback to `index.html` for client-side routes.
5. Visit the frontend’s HTTPS URL. Do not run the seed script against a production database.

For local or hosted development, see the setup instructions above. Once deployed, add the public application URL here.

## API Overview

- `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/ers/available`, `PATCH /api/ers/availability`
- `POST /api/chats`, `POST /api/chats/:chatId/accept`, `POST /api/chats/:chatId/decline`, `POST /api/chats/:chatId/end`
- `GET /api/chats/mine`, `GET /api/chats/:chatId/messages`, `POST /api/chats/:chatId/messages`
- `POST /api/chats/:chatId/rate`, `POST /api/reports`
- Administrative routes are under `/api/admin`.

## License

No license has been added yet. All rights are reserved by default unless a license is added to this repository.

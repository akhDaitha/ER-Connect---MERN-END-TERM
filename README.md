# ER Connect

Anonymous peer-support chat for students, connecting them with trained senior Emotional Responders (ERs).

## Project Name

**ER Connect — Anonymous Emotional Support Chat for Students**

**Demo video link :** https://drive.google.com/file/d/1NGijJRDf35Ybipvjl--a2e9u7AVlCRX4/view?usp=sharing
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

The repository includes a Render Blueprint in `render.yaml`. It builds the React client and serves it from the Express service, so the frontend, API, and Socket.IO share one HTTPS origin. This matches the app’s HTTP-only cookie configuration. The Blueprint service name matches the existing Render service so syncing it updates that service instead of creating a duplicate. See [Render Blueprints](https://render.com/docs/infrastructure-as-code).

1. In Render, connect the existing `ER-Connect---MERN-END-TERM` service to the Blueprint from this repository and select the `main` branch. Review the changes before syncing. The Blueprint keeps the current Free plan and region, and generates `JWT_SECRET` for you.
2. Supply `MONGO_URI` and `CHAT_KEY` as private Render environment variables. `CHAT_KEY` must match the key used to encrypt any existing messages in the selected database. Keep both values private and never commit them.
3. In MongoDB Atlas, allowlist the service’s outbound IP ranges from its **Connect → Outbound** panel; avoid opening database access to all IPs.
4. After the service deploys, open its `onrender.com` URL. The health check is available at `/api/health`; the home page serves the React app.

Render’s Free web services currently cost $0, but spin down after 15 minutes without traffic and can take about a minute to wake. Render describes Free instances as suitable for testing and hobby projects, not production. See [Render’s Free instance limitations](https://render.com/docs/free) and [Web Services guide](https://render.com/docs/web-services). Do not run the seed script against a production database.

## API Overview

- `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/ers/available`, `PATCH /api/ers/availability`
- `POST /api/chats`, `POST /api/chats/:chatId/accept`, `POST /api/chats/:chatId/decline`, `POST /api/chats/:chatId/end`
- `GET /api/chats/mine`, `GET /api/chats/:chatId/messages`, `POST /api/chats/:chatId/messages`
- `POST /api/chats/:chatId/rate`, `POST /api/reports`
- Administrative routes are under `/api/admin`.

## License

No license has been added yet. All rights are reserved by default unless a license is added to this repository.

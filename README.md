# DevLens

DevLens is an engineering intelligence platform built for teams that manage GitHub repositories. It connects to your org via GitHub OAuth and webhooks, then gives you a real-time view of pull request health, commit activity, developer productivity, and AI-flagged code risks — all in one dashboard.

The problem it solves is straightforward: code review is slow, risky PRs slip through, and most teams have no idea who their bottlenecks are until a production incident happens. DevLens surfaces that information automatically.

---

## Key Features

- **GitHub OAuth authentication** — login is frictionless, no separate signup
- **Real-time dashboard** via WebSockets — commits, PRs and alerts update instantly without polling
- **PR risk analysis** — each PR gets a risk score based on size, file churn, and AI analysis
- **AI code review (Gemini)** — on-demand analysis of a PR yields quality score, bug probability, security issues, and recommendations
- **Security alerts** — alerts for vulnerability patterns, leaked secrets, dependency issues, per repo
- **Developer profiles** — per-developer commit counts, PR throughput, code churn, and activity heatmaps
- **Team management** — role-based access (ADMIN / MEMBER / VIEWER) with email invites and a full invite flow
- **AI chatbot** — context-aware assistant embedded in the sidebar, scoped to your org's data
- **Notifications** — in-app notification system for invites, alerts, and system events
- **Manual payment flow** — UPI-based upgrade path for the Pro plan (₹499 lifetime), admin approval queue included
- **VSCode extension** — sidebar panel showing open PRs and risk scores for the currently open repo

---

## How It Works

1. A user logs in via GitHub OAuth. The backend issues a JWT stored in an httpOnly cookie.
2. They create an organization and connect a GitHub repository. This installs a webhook on the repo.
3. GitHub delivers push and PR events to `/api/v1/webhooks/github`. Webhook payloads are verified with HMAC-SHA256 before processing.
4. The backend processes events, stores commits and PR activity, and scores PRs for risk.
5. The frontend receives live updates over WebSockets so the dashboard reflects the current state.
6. On demand, any PR can be submitted for a deeper AI analysis using Gemini. Results (quality score, security findings, etc.) are cached.
7. The AI chatbot answers questions about the org's repos, PRs, and developers using the stored data as context.

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| **Frontend** | Next.js 15, React 18, Tailwind CSS, Zustand, Recharts, Framer Motion, Sonner |
| **Backend** | Node.js, Express 5, TypeScript |
| **Database** | MongoDB (Mongoose) |
| **AI** | Google Gemini via `@google/generative-ai` |
| **Auth** | GitHub OAuth 2.0, JWT (httpOnly cookie) |
| **Realtime** | WebSockets (`ws`) |
| **Validation** | Zod |
| **Logging** | Pino + pino-pretty |
| **VSCode Extension** | TypeScript, VS Code Extension API, Axios |

---

## Architecture

The project is a monorepo with three main parts:

```
DevLens/
├── apps/
│   └── frontend/          # Next.js app (App Router)
├── services/
│   └── backend/           # Express API server + WS server
└── extensions/
    └── devlens-vscode/    # VS Code sidebar extension
```

The backend is a single Express process. It handles REST routes, a WebSocket server, and webhook ingestion. There is no separate worker process — webhook processing is synchronous within the request cycle, which means it's simple but has limits at high event volume.

The frontend is a standard Next.js App Router project. Almost everything is a Client Component because of the real-time nature of the data. Zustand manages global state for the user, org, AI results, notifications, and chatbot.

The VSCode extension is entirely separate with its own `package.json` and does not share code with the frontend. It communicates directly with the backend API using a user-provided auth token.

---

## Project Structure

```
services/backend/src/
├── controllers/        # Route handlers
├── services/           # Business logic (AI, chatbot, webhook processing)
├── models/             # Mongoose schemas (User, Org, PR, Commit, Alert, etc.)
├── routes/             # Express routers
├── middlewares/        # auth, RBAC, rate limiting, validation, error handler
├── validators/         # Zod schemas
├── utils/              # Logger, token helpers, encryption
└── server.ts           # Entry point, WS server setup

apps/frontend/
├── app/                # Next.js routes (App Router)
│   ├── auth/           # OAuth callback
│   ├── organization/   # Dashboard, PRs, repos, developers, team, AI, alerts
│   ├── pricing/        # Payment page
│   └── page.tsx        # Landing page
├── components/
│   ├── ai/             # AI analysis cards, security panel, chatbot widget
│   ├── Landing/        # Marketing pages
│   ├── Layout/         # DashboardLayout, Sidebar, Navbar
│   └── Ui/             # Shared UI primitives
├── store/              # Zustand stores
├── lib/                # API client, WebSocket client, AI API wrappers
└── hooks/              # Custom React hooks
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- A GitHub OAuth App ([create one here](https://github.com/settings/developers))
- A Google Gemini API key (for AI features)

### 1. Clone the repo

```bash
git clone https://github.com/Abhishekkr6/DevLens.git
cd DevLens
```

### 2. Set up the backend

```bash
cd services/backend
cp .env.example .env   # or create .env manually (see below)
npm install
npm run dev
```

### 3. Set up the frontend

```bash
cd apps/frontend
cp .env.example .env.local   # or create manually
npm install
npm run dev
```

The frontend runs on `http://localhost:3000`, the backend on `http://localhost:4000`.

---

## Environment Variables

### Backend (`services/backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Port to run the server on (default: `4000`) |
| `MONGO_URL` | Yes | Full MongoDB connection string |
| `MONGO_DB_NAME` | No | Database name (default: `DevLens`) |
| `JWT_SECRET` | Yes | Secret key for signing JWTs. Use something long and random. |
| `GITHUB_CLIENT_ID` | Yes | From your GitHub OAuth App |
| `GITHUB_CLIENT_SECRET` | Yes | From your GitHub OAuth App |
| `GITHUB_WEBHOOK_SECRET` | Yes | Secret for verifying GitHub webhook payloads |
| `FRONTEND_URL` | Yes | URL of the frontend (`http://localhost:3000` in dev) |
| `GEMINI_API_KEY` | Yes* | Google Gemini API key. AI features are disabled if missing. |
| `NODE_ENV` | No | `development` or `production` |

### Frontend (`apps/frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_BACKEND_URL` | Yes | Backend base URL (`http://localhost:4000`) |

---

## Scripts

### Backend

```bash
npm run dev       # Start with ts-node-dev (hot reload)
npm run build     # Compile TypeScript to dist/
npm start         # Run compiled output
npm test          # Run Jest tests
```

### Frontend

```bash
npm run dev       # Next.js dev server
npm run build     # Production build
npm start         # Serve production build
npm run lint      # ESLint
```

### Root

```bash
npm run dev       # Runs both frontend and backend concurrently
```

---

## API Overview

All authenticated routes require a valid JWT cookie set during OAuth login.

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/v1/auth/github/login` | Redirects to GitHub OAuth |
| `GET` | `/api/v1/auth/github/callback` | OAuth callback, sets cookie |
| `POST` | `/api/v1/auth/logout` | Clears session |
| `GET` | `/api/v1/me` | Current authenticated user |
| `POST` | `/api/v1/orgs` | Create organization |
| `GET` | `/api/v1/orgs` | List user's organizations |
| `POST` | `/api/v1/orgs/:orgId/repos/connect` | Connect a GitHub repo |
| `GET` | `/api/v1/orgs/:orgId/dashboard` | Aggregated dashboard stats |
| `GET` | `/api/v1/orgs/:orgId/prs` | List PRs with risk scores |
| `GET` | `/api/v1/orgs/:orgId/developers` | Developer metrics |
| `GET` | `/api/v1/orgs/:orgId/activities` | Commit/event activity feed |
| `POST` | `/api/v1/ai/analyze-pr` | Trigger Gemini AI PR analysis |
| `GET` | `/api/v1/ai/security/:repoId` | Security alerts for a repo |
| `POST` | `/api/v1/chatbot/query` | Send a question to the AI assistant |
| `POST` | `/api/v1/webhooks/github` | GitHub webhook receiver |
| `POST` | `/api/v1/payments/request` | Submit a Pro upgrade payment request |

AI endpoints are rate-limited to **10 requests/hour** per user. Chatbot is **20 requests/hour**.

---

## Deployment

### Render (Backend)

A `render.yaml` is included. The backend deploys directly from `services/backend/`. Set all required environment variables in the Render dashboard — they're not committed.

```
Build: npm install && npm run build
Start: npm start
```

### Vercel (Frontend)

The frontend deploys to Vercel from `apps/frontend/`. Set `NEXT_PUBLIC_BACKEND_URL` to your deployed backend URL.

### Docker (Local full stack)

```bash
docker-compose up
```

This starts MongoDB, the backend on port `4000`, and the frontend on port `3000`.

---

## Limitations

- **Webhook processing is synchronous** — high-traffic repos with many events per second could cause delays
- **AI analysis is manual** — it's triggered per-PR on demand, not automatic on every push
- **Payment is manual verification** — the admin reviews and approves UPI payment requests manually; there's no automated payment gateway
- **Free tier is limited to 2 repos** — enforced by the `enforceRepoLimit` middleware
- **No email notifications** — all notifications are in-app only

---

## Roadmap (inferred from gaps in code)

- Automatic AI analysis triggered on PR open/update webhooks
- Email delivery for notifications and invite flows
- Automated payment gateway integration (currently manual UPI)
- Dashboard export / reporting
- Support for GitLab and Bitbucket webhooks

---

## License

MIT — built by [Abhishek Tiwari](https://abhishektiwari-18.vercel.app/)

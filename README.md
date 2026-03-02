# DevLens 🚀

**Real-time engineering visibility without the micromanagement.**

I built DevLens because I was tired of daily standups that felt like interrogations. I wanted a way to see *what* was happening in my repos—who's committing, what PRs are stuck, and where the risks are—without tapping anyone on the shoulder.

It's a full-stack platform that hooks directly into GitHub to track development velocity, analyze code risk (using a custom scoring algorithm), and stream updates live to a dashboard.

![DevLens Dashboard](./docs/dashboard-preview.png)

## Why I Built This

Managing distributed teams is hard. You either drown in GitHub notifications or you have no idea what's going on until release day.

I wanted something different:
- **Instant visibility**: I shouldn't have to refresh a page to see a new commit.
- **Risk detection, not just tracking**: A PR with 50 files changed is risky. I want to know about it *before* it merges.
- **Developer-first**: It should just work. Connect a repo, and the data starts flowing.

## Under the Hood 🛠️

This isn't a CRUD app. It's an event-driven system designed to handle high-frequency webhooks.

### The Stack

- **Frontend**: Next.js 15 (React 18) – moved to stable versions for reliability. Used Tailwind v3 for styling because I needed granular control over the design system.
- **Backend**: Node.js + Express 5. I stuck with Express because its middleware ecosystem is unbeatable for handling things like webhook signature verification.
- **Database**: MongoDB. I needed a flexible schema because commit metadata varies wildly. Plus, the aggregation pipeline is perfect for calculating velocity metrics on the fly.
- **Real-time**: Custom WebSocket implementation. When a webhook hits the backend, it pushes the event to the frontend instantly. No polling.

### Key Technical Decisions

**1. Multi-Tenant Architecture**
I wanted this to work for freelancers and agencies. You can create multiple Organizations, and repositories are scoped to them.
*Challenge*: Sharing a repo across two orgs.
*Solution*: Created a compound index on `(repoFullName, orgId)` so the same GitHub repo can exist in multiple contexts with different settings.

**2. Security First**
- **GitHub Tokens**: I don't store these in plain text. Everything is AES-256 encrypted using a custom `EncryptionService`.
- **Webhook Verification**: Every payload from GitHub is cryptographically verified using HMAC-SHA256 before we even parse the JSON. If the signature doesn't match, we drop the connection.

**3. Performance**
I denormalized `orgId` into the `Commit` and `PR` collections.
*Why?* Doing a `$lookup` (JOIN) on 50,000 commits just to filter by organization killed performance. A little data duplication gave me sub-100ms dashboard loads.

## Features

- **👀 Live Activity Feed**: Watch commits and PRs roll in real-time.
- **⚠️ Risk Scoring**: Every PR gets a score (0-100) based on size, complexity, and file types.
- **🔔 Smart Notifications**: Alerts for high-risk changes, but only if they cross your meaningful thresholds.
- **📊 Velocity Charts**: See if your team is speeding up or slowing down over time.
- **🔐 Enterprise-Grade Auth**: Secure login via GitHub OAuth with automatic token handling.

## Deployment

I've containerized the whole thing. You can spin it up with Docker Compose or deploy to Render/Vercel.

**Environment Setup:**
You'll need a `.env` file with your GitHub OAuth credentials and a MongoDB connection string. Check `.env.example` for the template.

```bash
# Easy start
docker-compose up --build
```

## Future Plans

I'm currently working on:
- **Slack Integration**: Pushing these alerts to where the team actually chats.
- **AI Code Review**: Integrating a deeper LLM analysis to explain *why* a PR is risky, not just that it is.

---
*Built with ❤️ (and a lot of coffee) by Abhishek Tiwari.*

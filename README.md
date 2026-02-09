# TeamPulse

A full-stack SaaS platform for engineering teams to monitor GitHub repository activity, track developer metrics, and identify code risks in real-time. Includes a VS Code extension for in-IDE insights.

## Project Overview

TeamPulse solves the visibility gap in distributed engineering teams. Instead of relying on daily standups or manual status updates, engineering leads can see exactly what's happening across repositories: who's committing, what PRs are open, which changes carry risk, and how fast the team is moving.

This is not a tutorial project. It integrates GitHub webhooks, processes events asynchronously, calculates risk scores based on code complexity, and delivers updates via WebSockets. It's built to handle multiple organizations, role-based access control, and real-time collaboration.

The platform is designed for engineering managers and team leads who need actionable insights without interrupting developer workflows. The companion VS Code extension brings these insights directly into the IDE.

## Key Features

- Multi-organization workspace management with role-based permissions (Admin, Member, Viewer)
- Real-time commit and pull request tracking via GitHub webhooks
- Automated PR risk scoring based on file changes, additions/deletions, and complexity
- Live dashboard updates using WebSocket connections
- Developer activity profiles with contribution graphs and repository statistics
- Organization-wide alerts for high-risk PRs and critical events
- Team invitation system with pending/active member status
- Real-time notifications with sound effects for different event types
- Repository settings with configurable alert thresholds
- Secure GitHub OAuth authentication with token refresh handling
- **VS Code Extension** - Lightweight sidebar with PR overview and risk alerts directly in your IDE

## Tech Stack

### Frontend
- **Next.js 16** (React 19) - Server-side rendering and modern React features including the React Compiler
- **TypeScript** - Type safety across the entire frontend
- **Tailwind CSS 4** - Utility-first styling with custom design tokens
- **Zustand** - Lightweight state management for global app state
- **Motion (Framer Motion)** - Smooth animations and transitions
- **Recharts** - Data visualization for metrics and activity graphs
- **Sonner** - Toast notifications for user feedback
- **Lucide React** - Consistent icon system

### Backend
- **Node.js + Express 5** - RESTful API server
- **TypeScript** - End-to-end type safety
- **MongoDB + Mongoose** - Document database for flexible schema design
- **WebSocket (ws)** - Real-time bidirectional communication
- **Zod** - Runtime schema validation for API requests
- **bcryptjs** - Password hashing (for webhook secrets)
- **jsonwebtoken** - JWT-based session management
- **Helmet** - Security headers
- **Pino** - Structured logging for production debugging

### External Services
- **GitHub OAuth** - Authentication provider
- **GitHub Webhooks** - Event-driven repository activity capture
- **MongoDB Atlas** - Cloud database hosting
- **Render/Vercel** - Deployment platforms

### VS Code Extension
- **TypeScript** - Type-safe extension development
- **VS Code Extension API** - Native IDE integration
- **Webview API** - Custom sidebar UI with HTML/CSS/JavaScript
- **axios** - HTTP client for REST API communication
- **VS Code SecretStorage** - Encrypted token storage at OS level

### Why These Choices?
- Next.js for SEO-friendly landing pages and fast client-side navigation
- MongoDB for schema flexibility as features evolve (e.g., adding new metric types)
- WebSockets for instant dashboard updates without polling
- Zustand over Redux for simpler state management with less boilerplate
- TypeScript to catch errors at compile time, especially important for webhook payload parsing
- VS Code Extension for seamless developer workflow integration without context switching

## System Architecture

```
User Browser
    ↓
Next.js Frontend (React 19 + TypeScript)
    ↓ (HTTP + WebSocket)
Express Backend (Node.js + TypeScript)
    ↓
MongoDB (User, Org, Repo, Commit, PR, Alert, Notification models)
    ↑
GitHub Webhooks (push, pull_request events)
```

### Flow Example: New Commit
1. Developer pushes code to GitHub
2. GitHub sends webhook POST to `/api/v1/webhooks/github`
3. Backend validates webhook signature, parses payload
4. Commit data saved to MongoDB with `repoId` and `orgId`
5. WebSocket server broadcasts `commit:new` event to connected clients
6. Frontend receives event, updates dashboard in real-time
7. If commit triggers alert threshold, notification created and sent via WebSocket

### Multi-Organization Design
- Each user can belong to multiple organizations
- Repositories are scoped to organizations (same repo can exist in different orgs)
- Commits and PRs are indexed by both `repoId` and `orgId` for efficient querying
- Role-based middleware checks user permissions before allowing org/repo access

## Authentication & Security

### How Authentication Works
1. User clicks "Login with GitHub"
2. Redirected to GitHub OAuth consent screen
3. GitHub redirects back with authorization code
4. Backend exchanges code for access token
5. Backend fetches user profile from GitHub API
6. User record created/updated in MongoDB (keyed by `githubId` to prevent duplicates)
7. JWT signed with user ID and stored in httpOnly cookie (`teampulse_token`)
8. Frontend reads cookie on subsequent requests via middleware

### Token Handling
- Access tokens stored encrypted in database
- JWT expires after 30 days
- Cookies use `SameSite=None; Secure` in production for cross-origin requests
- GitHub tokens used to create webhooks and fetch repository data

### Security Measures
- Webhook signature verification using HMAC-SHA256
- Rate limiting on API endpoints (100 requests per 15 minutes)
- CORS restricted to known frontend origins
- Helmet middleware for security headers
- Input validation using Zod schemas
- MongoDB injection prevention via Mongoose sanitization

### Known Limitations
- No refresh token rotation (GitHub tokens can expire)
- Webhook secrets stored as bcrypt hashes, not encrypted (one-way only)
- No 2FA support beyond GitHub's own authentication
- WebSocket connections not authenticated per-message (relies on initial HTTP auth)

## Database Design

### Main Collections

**User**
- `githubId` (unique) - Canonical user identifier
- `orgIds[]` - Array of organization ObjectIds user belongs to
- `defaultOrgId` - Last selected organization for UX
- `githubAccessToken` - Encrypted token for GitHub API calls
- `role` - Global role (admin/lead/dev/viewer)

**Org**
- `name`, `slug` - Organization identity
- `createdBy` - User who created the org
- `members[]` - Embedded array of `{ userId, role, status }` for team management

**Repo**
- `repoFullName` - GitHub owner/repo format (e.g., "facebook/react")
- `orgId` - Organization this repo belongs to
- `webhookId`, `webhookSecretHash` - GitHub webhook configuration
- `settings.alertThresholds` - Configurable limits for churn rate, open PRs, etc.
- Compound index on `(repoFullName, orgId)` allows same repo in multiple orgs

**Commit**
- `repoId`, `orgId` - Scoped to repository and organization
- `sha`, `message`, `author`, `timestamp` - Git metadata
- `stats` - Additions, deletions, total changes
- Index on `(repoId, timestamp)` for fast time-series queries

**PR (Pull Request)**
- `repoId`, `orgId`, `prNumber` - Unique identifier
- `state` (open/closed/merged), `riskScore` (0-100)
- `filesChanged`, `additions`, `deletions` - Complexity metrics
- Risk score calculated based on size and file count

**Alert**
- `orgId`, `repoId`, `type`, `severity` (low/medium/high)
- `resolvedAt`, `resolvedBy` - Acknowledgment tracking
- Index on `(orgId, createdAt)` for dashboard queries

**Notification**
- `userId`, `type` (team_invite, alert, toast)
- `metadata` - Flexible JSON for event-specific data
- `read` - Boolean for unread badge counts

### Why This Structure?
- Embedded `members[]` in Org avoids JOIN-like queries (MongoDB best practice)
- Separate Commit/PR collections instead of embedding allows efficient pagination
- `orgId` denormalized into Commit/PR for fast filtering without lookups
- Compound indexes on `(repoId, orgId)` prevent duplicate repos per org
- Flexible `metadata` field in Notification supports new event types without schema changes

## API Overview

### Authentication
- `GET /api/v1/auth/github/login` - Redirect to GitHub OAuth
- `GET /api/v1/auth/github/callback` - Handle OAuth callback, set JWT cookie
- `POST /api/v1/auth/logout` - Clear session cookie
- `DELETE /api/v1/auth/logout` - Delete user account and all associated data

### Organizations
- `POST /api/v1/orgs` - Create new organization
- `GET /api/v1/orgs` - List user's organizations
- `GET /api/v1/orgs/:orgId/members` - Get organization members
- `POST /api/v1/orgs/:orgId/invite` - Invite user to organization (Admin only)
- `POST /api/v1/orgs/:orgId/invite/accept` - Accept pending invitation
- `POST /api/v1/orgs/:orgId/invite/reject` - Reject invitation
- `DELETE /api/v1/orgs/:orgId/leave` - Leave organization
- `DELETE /api/v1/orgs/:orgId` - Delete organization (Admin only)

### Repositories
- `GET /api/v1/orgs/:orgId/repos` - List connected repositories
- `POST /api/v1/orgs/:orgId/repos/connect` - Connect GitHub repository, create webhook
- `GET /api/v1/orgs/:orgId/repos/:repoId` - Get repository details with metrics
- `PATCH /api/v1/orgs/:orgId/repos/:repoId/settings` - Update alert thresholds
- `DELETE /api/v1/orgs/:orgId/repos/:repoId` - Disconnect repository, delete webhook

### Dashboard & Metrics
- `GET /api/v1/orgs/:orgId/dashboard` - Aggregate metrics (commits, PRs, velocity)
- `GET /api/v1/orgs/:orgId/alerts` - List active alerts
- `POST /api/v1/orgs/:orgId/alerts/:alertId/acknowledge` - Mark alert as resolved

### Webhooks (GitHub)
- `POST /api/v1/webhooks/github` - Receive push, pull_request, and other events

### User Profile
- `GET /api/v1/me` - Current user profile
- `GET /api/v1/developers/:userId` - Public developer profile with activity stats

### Notifications
- `GET /api/v1/notifications` - List user notifications
- `PATCH /api/v1/notifications/:id/read` - Mark notification as read

## VS Code Extension

### Overview

The TeamPulse VS Code extension brings real-time PR insights directly into your IDE. View open pull requests, identify high-risk PRs, and access the full dashboard without leaving your code editor.

### Features

- **Automatic Repository Detection** - Detects GitHub repositories in your workspace
- **Pull Request Overview** - View all open PRs with risk scores and metadata
- **High-Risk Alerts** - Separate section for PRs with risk score ≥ 70
- **One-Click Access** - Open PRs in browser or jump to full dashboard
- **Secure Authentication** - Tokens stored in OS-level encrypted storage (Windows Credential Manager, macOS Keychain, Linux Secret Service)
- **Theme Compatible** - Seamlessly integrates with VS Code dark/light themes
- **Real-Time Refresh** - Manual refresh to fetch latest PR data

### Installation

**From Source** (for development):

1. Navigate to extension directory:
```bash
cd extensions/teampulse-vscode
```

2. Install dependencies:
```bash
npm install
```

3. Compile TypeScript:
```bash
npm run compile
```

4. Open in VS Code and press **F5** to launch Extension Development Host

**From VSIX** (for distribution):

1. Package the extension:
```bash
npm run package
```

2. Install the generated `.vsix` file:
```bash
code --install-extension teampulse-vscode-0.1.0.vsix
```

### Usage

1. **Login**: Click TeamPulse icon in Activity Bar → Enter your auth token
2. **Open Repository**: Open a workspace with a GitHub repository
3. **View PRs**: PRs automatically appear in the sidebar
4. **Click PR**: Opens PR in browser
5. **Refresh**: Click refresh button to update data

### Architecture

```
VS Code Extension
    ↓
Extension Host (Node.js)
    ↓ (HTTP REST API)
TeamPulse Backend
    ↓
MongoDB
```

**Key Components**:
- `extension.ts` - Activation, command registration, event listeners
- `TeamPulseViewProvider.ts` - Webview state management and rendering
- `authManager.ts` - Secure token storage using VS Code SecretStorage
- `apiClient.ts` - REST API client with error handling
- `repoDetector.ts` - Git repository detection using VS Code Git API
- `webview/main.js` - Webview UI logic with JSDoc type annotations

### Security

- Auth tokens stored in **VS Code SecretStorage** (encrypted at OS level)
- No plaintext token storage
- HTTPS-only API communication
- Content Security Policy in webview
- JWT validation on every API request

### Development

See [`extensions/teampulse-vscode/DEVELOPMENT.md`](extensions/teampulse-vscode/DEVELOPMENT.md) for:
- Project structure
- Development workflow
- Testing procedures
- Publishing to VS Code Marketplace

## Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB instance (local or Atlas)
- GitHub OAuth App credentials

### Environment Variables

Create `.env` in `services/backend/`:

```
PORT=4000
NODE_ENV=development

MONGO_URL=mongodb://localhost:27017
MONGO_DB_NAME=teampulse

JWT_SECRET=your-random-secret-key-here

GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-client-secret

FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000

WEBHOOK_SECRET=your-webhook-secret-for-github

LOG_LEVEL=info
```

Create `.env.local` in `apps/frontend/`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

### Local Setup Steps

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd teampulse
```

2. **Install root dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd apps/frontend
npm install
cd ../..
```

4. **Install backend dependencies**
```bash
cd services/backend
npm install
cd ../..
```

5. **Set up environment variables** (see above)

6. **Start MongoDB** (if running locally)
```bash
mongod --dbpath /path/to/data
```

7. **Run development servers**
```bash
npm run dev
```

This starts both frontend (port 3000) and backend (port 4000) concurrently.

8. **Create GitHub OAuth App**
- Go to GitHub Settings > Developer settings > OAuth Apps
- Create new app with callback URL: `http://localhost:3000/auth/github/callback`
- Copy Client ID and Client Secret to backend `.env`

9. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

10. **(Optional) Set up VS Code Extension**
```bash
cd extensions/teampulse-vscode
npm install
npm run compile
# Press F5 in VS Code to launch Extension Development Host
```

### Common Setup Mistakes

- **MongoDB connection fails**: Ensure `MONGO_URL` includes the correct host and port. If using Atlas, include the database name in the connection string.
- **GitHub OAuth redirect fails**: Verify `FRONTEND_URL` in backend `.env` matches your frontend URL exactly (no trailing slash).
- **Webhooks not working locally**: Use ngrok or similar to expose localhost to GitHub webhooks, or test with deployed backend URL.
- **WebSocket connection refused**: Check `NEXT_PUBLIC_WS_URL` matches backend WebSocket server URL.
- **CORS errors**: Ensure frontend origin is listed in backend `allowedOrigins` array in `app.ts`.

## Project Challenges & Decisions

### Challenge: Multi-Organization Repository Sharing
**Problem**: Two organizations might want to track the same GitHub repository independently.

**Solution**: Compound unique index on `(repoFullName, orgId)` in Repo model. This allows the same repository to exist in multiple organizations with separate webhook configurations and settings. Commits and PRs are also indexed by both `repoId` and `orgId` to ensure data isolation.

**Trade-off**: Slightly more complex queries (must always filter by orgId), but cleaner data model than trying to share a single repo record.

### Challenge: Webhook Reliability
**Problem**: GitHub webhooks can fail or arrive out of order. If the backend is down, events are lost.

**Solution**: Webhook signature verification ensures authenticity. Events are processed synchronously to maintain order. For production, a message queue (e.g., Redis + Bull) would be added to retry failed webhooks.

**Current Limitation**: No retry mechanism. If backend is down during a webhook delivery, that event is lost permanently.

### Challenge: Real-Time Updates Without Polling
**Problem**: Dashboard needs to update instantly when commits/PRs arrive, but polling is inefficient.

**Solution**: WebSocket server attached to Express HTTP server. When webhook handler saves a commit, it broadcasts to all connected clients. Frontend listens for events and updates Zustand store.

**Trade-off**: WebSocket connections don't scale horizontally without a pub/sub layer (e.g., Redis). Current implementation works for single-server deployments.

### Challenge: PR Risk Scoring
**Problem**: Not all PRs are equally risky. Large PRs with many file changes are harder to review.

**Solution**: Simple heuristic based on `filesChanged`, `additions`, and `deletions`. Score ranges from 0-100. Thresholds are configurable per repository.

**Limitation**: Doesn't account for code complexity, test coverage, or author experience. A production system would use static analysis tools.

### Challenge: GitHub Token Expiration
**Problem**: GitHub access tokens can expire or be revoked.

**Solution**: Tokens are stored in the database and refreshed on each login. If a token is invalid, webhook creation fails gracefully with an error message.

**What I'd Improve**: Implement GitHub refresh token flow to automatically renew tokens without requiring re-login.

## What I Learned

### Engineering Lessons

1. **Schema design matters early**: Initially stored `orgId` as a string in some collections and ObjectId in others. This caused type mismatches and required a migration script. Lesson: enforce type consistency from day one.

2. **WebSocket authentication is tricky**: Unlike HTTP requests, WebSocket connections don't send cookies on every message. Had to rely on initial handshake authentication and trust the connection. In production, would implement per-message token validation.

3. **Webhook signature verification is non-negotiable**: GitHub sends a SHA-256 HMAC signature. Verifying this prevents malicious actors from sending fake webhook payloads. Implemented using raw body parser before JSON middleware.

4. **Compound indexes drastically improve query performance**: Queries filtering by `orgId` and `repoId` were slow until adding compound indexes. MongoDB query planner now uses the index efficiently.

5. **Real-time notifications need sound**: Users don't always watch the screen. Adding distinct sound effects for different notification types (team invite, alert, toast) significantly improved UX based on testing.

6. **Role-based middleware prevents bugs**: Instead of checking permissions in every controller, a `requireOrgRole` middleware validates user access before the request reaches the handler. Cleaner and more secure.

7. **Environment variable management is painful**: Different values for local, staging, and production. Used `.env` files for local, but deployment platforms (Render, Vercel) require manual configuration. Would use a secrets manager in production.

8. **TypeScript strict mode catches real bugs**: Enabled `strict: true` in `tsconfig.json`. Found several null/undefined edge cases that would have caused runtime errors.

## Possible Improvements

### Realistic Future Enhancements

- **Webhook retry queue**: Use Redis + Bull to retry failed webhook deliveries instead of losing events
- **Advanced PR risk scoring**: Integrate static analysis tools (e.g., SonarQube) for code quality metrics
- **GitHub App instead of OAuth**: GitHub Apps have better rate limits and don't require user tokens for webhooks
- **Horizontal scaling**: Add Redis pub/sub for WebSocket broadcasting across multiple backend instances
- **Email notifications**: Send digest emails for weekly summaries and critical alerts
- **Custom metrics**: Allow users to define custom metrics (e.g., deployment frequency, MTTR)
- **Time-series analytics**: Store historical metrics for trend analysis (e.g., velocity over time)
- **Slack/Discord integration**: Post notifications to team chat channels
- **Audit logs**: Track all organization changes (member added/removed, repo connected, etc.)
- **Export reports**: Generate PDF/CSV reports for stakeholder presentations

### Known Technical Debt

- **No database migrations framework**: Schema changes require manual scripts. Would use a tool like `migrate-mongo`.
- **Frontend state management could be cleaner**: Some components fetch data directly instead of using Zustand. Would centralize all API calls in store actions.
- **Error handling inconsistency**: Some API endpoints return `{ success: false, error }`, others throw exceptions. Would standardize error response format.
- **No end-to-end tests**: Only manual testing currently. Would add Playwright tests for critical user flows.
- **WebSocket reconnection logic is basic**: Frontend retries connection on close, but doesn't handle exponential backoff or message replay.

---

**Built by Abhishek Tiwari** as a portfolio project demonstrating full-stack engineering skills, real-time systems, and production-grade architecture.

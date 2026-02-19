# TeamPulse Frontend 🎨

The user interface for TeamPulse, built with **Next.js 15 (React 18)** and **Tailwind CSS 4**.

## Architecture

I chose Next.js for its hybrid rendering capabilities. The marketing pages (`/`) are statically generated for SEO, while the dashboard (`/organization/[id]`) uses client-side fetching with refined loading states for a snappy application feel.

### Key Technologies

- **State Management**: `zustand` - Used for global stores like `useUserStore` and `useSocketStore`. It's much simpler than Redux and has less boilerplate.
- **Styling**: Tailwind CSS + `lucide-react` for icons. I use a custom `tailwind.config.ts` to enforce the design system (colors, spacing).
- **Real-time**: Custom WebSocket hook (`useSocket`) that connects to the backend and dispatches updates to Zustand stores.
- **Charts**: `recharts` for the velocity and activity metric visualizations.

## Directory Structure

- `app/` - App Router pages and layouts.
  - `(auth)/` - Auth layout (login/callback).
  - `organization/` - Main dashboard application routes.
- `components/` - Reusable UI components.
  - `ui/` - Low-level design system primitives (buttons, cards).
  - `dashboard/` - Domain-specific widgets (Commit feed, PR lists).
- `store/` - Zustand stores.
- `hooks/` - Custom hooks (`useAuth`, `useSocket`).
- `lib/` - Utilities and helpers.

## Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup Environment**:
   Copy `.env.local.example` to `.env.local` and set your API URL.
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:4000
   NEXT_PUBLIC_WS_URL=ws://localhost:4000
   ```

3. **Run Dev Server**:
   ```bash
   npm run dev
   ```

## Design Philosophy

The UI is designed to be **dense but readable**. Engineering dashboards often suffer from checking too much info. I prioritized:
- **Alerts first**: High-risk PRs are always at the top.
- **Visual noise reduction**: Subtle borders and consistent spacing.
- **Dark mode first**: Because developers. 🌙

---
*Part of the [TeamPulse](../README.md) project.*

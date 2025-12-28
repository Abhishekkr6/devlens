
export const DEMO_STATS = [
  { label: "Commits (last 7 days)", value: "124", change: "+12%", trend: "up" },
  { label: "Active Pull Requests", value: "9", change: "-2", trend: "down" },
  { label: "High Risk PRs", value: "3", change: "+1", trend: "up", alert: true },
  { label: "Active Developers", value: "6", change: "0", trend: "neutral" },
];

export const DEMO_ACTIVITY = [
  { day: "Mon", commits: 12 },
  { day: "Tue", commits: 18 },
  { day: "Wed", commits: 8 },
  { day: "Thu", commits: 24 },
  { day: "Fri", commits: 15 },
  { day: "Sat", commits: 4 },
  { day: "Sun", commits: 2 },
];

export const DEMO_PRS = [
  {
    id: 17,
    title: "feat(auth): Update OAuth scopes for GitHub",
    repo: "monorepo-web",
    status: "HIGH RISK",
    author: "Alice D.",
    time: "2h ago",
  },
  {
    id: 24,
    title: "fix(ui): Resolve sidebar overlapping issue",
    repo: "design-system",
    status: "OPEN",
    author: "Bob S.",
    time: "4h ago",
  },
  {
    id: 29,
    title: "chor(deps): Bump next.js to 14.1.0",
    repo: "monorepo-web",
    status: "MERGED",
    author: "Charlie K.",
    time: "1d ago",
  },
];

export const DEMO_LEADERBOARD = [
  { name: "Alice D.", commits: 42, prs: 5, status: "Consistent Contributor" },
  { name: "Bob S.", commits: 28, prs: 3, status: "Reviewing" },
  { name: "Charlie K.", commits: 15, prs: 8, status: "Under Load" },
  { name: "Diana P.", commits: 33, prs: 2, status: "Shipping Features" },
];

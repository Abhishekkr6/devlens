"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, GitPullRequest, Bell, Activity, Settings } from "lucide-react";

const links = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Activity", href: "/dashboard/activity", icon: Activity },
  { name: "PRs", href: "/dashboard/prs", icon: GitPullRequest },
  { name: "Alerts", href: "/dashboard/alerts", icon: Bell },
  { name: "Developers", href: "/dashboard/developers", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-slate-900/95 backdrop-blur-3xl border-r border-border flex flex-col">
      <div className="px-4 py-4 border-b border-border">
        <h1 className="text-lg font-bold tracking-tight text-text-primary">TeamPulse</h1>
        <p className="text-xs text-text-secondary">Engineering insights</p>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {links.map((l) => {
          const Icon = l.icon;
          const active = l.href === "/dashboard"
            ? pathname === l.href
            : pathname === l.href || pathname.startsWith(l.href + "/");

          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-all duration-200 group relative ${active
                ? "bg-white text-slate-900 font-bold shadow-xl shadow-white/20 scale-[1.02] border-2 border-[#4354E3]"
                : "text-slate-400 hover:text-white hover:bg-white/5 border-2 border-transparent"
                }`}
            >
              <Icon className="w-4 h-4" />
              <span>{l.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

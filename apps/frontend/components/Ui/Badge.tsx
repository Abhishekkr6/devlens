import React from "react";

type BadgeType = "default" | "success" | "warning" | "danger" | "info";

export function Badge({
  children,
  type = "default",
}: {
  children: React.ReactNode;
  type?: BadgeType;
}) {
  const variants: Record<BadgeType, string> = {
    default: "bg-surface text-text-secondary border border-border",
    success: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
    warning: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
    danger: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400",
    info: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${variants[type]}`}>
      {children}
    </span>
  );
}

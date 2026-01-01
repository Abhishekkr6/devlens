"use client";

import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "destructive";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center px-3 py-1.5 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer";
  const variants: Record<Variant, string> = {
    primary: "bg-brand text-white hover:bg-brand/90 focus:ring-brand",
    secondary: "bg-slate-200 dark:bg-slate-800 text-text-primary hover:bg-slate-300 dark:hover:bg-slate-700 focus:ring-slate-400",
    ghost: "bg-transparent text-text-secondary hover:bg-surface hover:text-text-primary focus:ring-slate-300",
    destructive: "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-600",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

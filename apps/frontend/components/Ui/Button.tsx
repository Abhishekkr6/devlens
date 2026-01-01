"use client";

import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "destructive" | "outline";

export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: ButtonSize;
}

export function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer";

  const variants: Record<Variant, string> = {
    primary: "bg-brand text-white hover:bg-brand/90 focus:ring-brand",
    secondary: "bg-slate-200 dark:bg-slate-800 text-text-primary hover:bg-slate-300 dark:hover:bg-slate-700 focus:ring-slate-400",
    ghost: "bg-transparent text-text-secondary hover:bg-surface hover:text-text-primary focus:ring-slate-300",
    destructive: "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-600",
    outline: "bg-transparent border border-border text-text-primary hover:bg-surface focus:ring-slate-300",
  };

  const sizes: Record<ButtonSize, string> = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}

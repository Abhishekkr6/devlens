"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react"; // Assuming lucide-react is installed, if not we'll use SVG

export default function ThemeToggle() {
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check initial value from data-theme or storage
        const storedTheme = localStorage.getItem("theme");
        const docTheme = document.documentElement.getAttribute("data-theme");

        if (storedTheme === "dark" || storedTheme === "light") {
            setTheme(storedTheme);
        } else if (docTheme === "dark") {
            setTheme("dark");
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches && !storedTheme) {
            // Default to system if no storage
            setTheme("dark");
            document.documentElement.setAttribute("data-theme", "dark");
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    };

    // Avoid hydration mismatch by rendering a placeholder or standard button until mounted
    if (!mounted) {
        return <div className="w-9 h-9" />; // Placeholder
    }

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-surface border border-border text-text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Theme"
        >
            {theme === "light" ? (
                <Sun className="w-5 h-5 text-warning" />
            ) : (
                <Moon className="w-5 h-5 text-brand" />
            )}
        </button>
    );
}

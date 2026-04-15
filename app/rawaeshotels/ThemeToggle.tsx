"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  return (
    <button
      type="button"
      className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
      onClick={() => document.documentElement.classList.toggle("dark")}
      aria-label="تبديل الوضع الليلي"
    >
      <Moon className="size-5 block dark:hidden" aria-hidden />
      <Sun className="size-5 hidden dark:block" aria-hidden />
    </button>
  );
}

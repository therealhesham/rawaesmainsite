"use client";

export function ThemeToggle() {
  return (
    <button
      type="button"
      className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
      onClick={() => document.documentElement.classList.toggle("dark")}
      aria-label="تبديل الوضع الليلي"
    >
      <span className="material-symbols-outlined block dark:hidden">dark_mode</span>
      <span className="material-symbols-outlined hidden dark:block">light_mode</span>
    </button>
  );
}

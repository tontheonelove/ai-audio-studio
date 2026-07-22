"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  variant?: "icon" | "full";
  className?: string;
}

export function ThemeToggle({ variant = "icon", className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // กัน hydration mismatch (next-themes รู้ theme จริงหลัง mount เท่านั้น)
  useEffect(() => setMounted(true), []);

  const isDark = mounted && theme === "dark";
  const toggle = () => setTheme(isDark ? "light" : "dark");

  const Icon = isDark ? Moon : Sun;
  const label = isDark ? "โหมดมืด" : "โหมดสว่าง";

  // ===== แบบเต็ม (icon + ข้อความ) — สำหรับ sidebar desktop =====
  if (variant === "full") {
    return (
      <button
        onClick={toggle}
        aria-label="สลับธีม"
        className={cn(
          "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all",
          "bg-slate-900/5 hover:bg-slate-900/10 dark:bg-white/10 dark:hover:bg-white/20",
          "border border-slate-200 dark:border-white/15 text-foreground",
          className
        )}
      >
        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 dark:from-indigo-500 dark:to-purple-600 flex items-center justify-center shadow-sm ring-1 ring-inset ring-white/30">
          <Icon className="w-4 h-4 text-white" />
        </span>
        <div className="text-left min-w-0">
          <p className="text-sm font-semibold leading-tight">{label}</p>
          <p className="text-xs text-muted-foreground leading-tight">คลิกเพื่อสลับธีม</p>
        </div>
      </button>
    );
  }

  // ===== แบบ icon อย่างเดียว — สำหรับ mobile top nav =====
  return (
    <button
      onClick={toggle}
      aria-label="สลับธีม"
      className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
        "bg-slate-900/5 hover:bg-slate-900/10 dark:bg-white/10 dark:hover:bg-white/20",
        "border border-slate-200 dark:border-white/20 text-foreground",
        className
      )}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
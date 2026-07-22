"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages, AudioLines, Music, Captions, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";

const NAV_ITEMS = [
  {
    href: "/translator",
    label: "AI Translator",
    description: "ถอดความ + แปลซับไทย",
    icon: Languages,
    gradient: "from-orange-400 to-amber-500",
  },
  {
    href: "/tts",
    label: "Text-to-Speech",
    description: "OmniVoice • 600+ ภาษา",
    icon: AudioLines,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    href: "/music-separator",
    label: "Music Separator",
    description: "UVR5 • แยก Vocal/Instrumental",
    icon: Music,
    gradient: "from-rose-500 to-pink-600",
  },
  {
    href: "/asr",
    label: "Speech-to-Text",
    description: "Whisper • ถอดข้อความ",
    icon: Captions,
    gradient: "from-blue-500 to-cyan-600",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* ===== Desktop Sidebar (md+) ===== */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 z-40 glass border-r border-white/40 dark:border-white/10 shadow-xl">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-orange-100 dark:border-white/10">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/40 ring-1 ring-inset ring-white/30 animate-pulse-glow">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground leading-tight">AI Audio Studio 🚀</h1>
            <p className="text-xs text-muted-foreground">by TonLikeIT</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 shadow-sm shadow-orange-500/10"
                    : "hover:bg-white/60 dark:hover:bg-slate-800/50 border border-transparent hover:shadow-sm"
                )}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all",
                    isActive
                      ? `bg-gradient-to-br ${item.gradient} shadow-md ring-1 ring-inset ring-white/30`
                      : "bg-slate-200/80 dark:bg-slate-700 group-hover:scale-105"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-[18px] h-[18px]",
                      isActive ? "text-white" : "text-slate-600 dark:text-slate-300"
                    )}
                  />
                </div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-semibold truncate",
                      isActive
                        ? "text-orange-700 dark:text-orange-300"
                        : "text-foreground"
                    )}
                  >
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer — 🌙 ปุ่มสลับธีม (แบบ full = ใหญ่ + มีข้อความ = ไม่มีทางหาย) */}
        <div className="px-3 py-4 border-t border-orange-100 dark:border-white/10 space-y-3">
          <ThemeToggle variant="full" />
          <div className="flex justify-center">
            <Badge
              variant="outline"
              className="bg-orange-50 dark:bg-white/10 border-orange-200 dark:border-white/20 text-orange-700 dark:text-foreground text-xs"
            >
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse" />
              v3.0
            </Badge>
          </div>
        </div>
      </aside>

      {/* ===== Mobile Top Nav (<md) ===== */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 glass border-b border-white/40 dark:border-white/10 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center shadow-md ring-1 ring-inset ring-white/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-foreground text-sm">AI Studio</span>
          </div>
          <ThemeToggle />
        </div>
        <div className="flex gap-1 px-3 pb-3 overflow-x-auto no-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0",
                  isActive
                    ? "bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-md shadow-orange-500/30"
                    : "bg-white/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                )}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
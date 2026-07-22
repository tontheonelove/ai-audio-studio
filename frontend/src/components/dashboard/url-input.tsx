"use client";

import { Link2 } from "lucide-react";

interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function UrlInput({ value, onChange }: UrlInputProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-slate-600 mb-8 shadow-inner">
      <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2">
        🔗 วางลิงก์ YouTube หรือไฟล์สื่อ
      </label>
      <div className="relative">
        <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full p-4 pl-12 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-700 dark:text-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/30 outline-none transition"
        />
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        รองรับ: YouTube, Vimeo, SoundCloud, และลิงก์ตรง .mp3/.mp4
      </p>
    </div>
  );
}
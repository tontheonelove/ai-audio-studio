"use client";

import { Download, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  audioUrl: string | null;
  filename: string;
}

export function AudioResult({ audioUrl, filename }: Props) {
  if (!audioUrl) return null;

  return (
    <div className="rounded-2xl p-5 md:p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-slate-900/30 border border-orange-200 dark:border-orange-900/40 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-md ring-1 ring-inset ring-white/30">
          <Volume2 className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground">สร้างเสียงเสร็จแล้ว! 🎉</p>
          <p className="text-xs text-muted-foreground truncate">{filename}</p>
        </div>
      </div>

      <audio controls src={audioUrl} className="w-full mb-4" />

      <a href={audioUrl} download={filename} className="block">
        <Button
          variant="gradient"
          className="w-full"
        >
          <Download className="w-5 h-5" />
          ดาวน์โหลด .wav
        </Button>
      </a>
    </div>
  );
}
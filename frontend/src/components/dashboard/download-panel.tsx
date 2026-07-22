"use client";

import { Download, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DownloadPanelProps {
  downloadUrl: string | null;
  filename: string;
  info: string;
}

export function DownloadPanel({ downloadUrl, filename, info }: DownloadPanelProps) {
  if (!downloadUrl) return null;

  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 shadow-2xl border border-white/20">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-5">
          <CheckCircle2 className="w-16 h-16 text-white animate-bounce" />
          <div>
            <p className="text-2xl font-bold text-white mb-1">สร้างเสร็จเรียบร้อย!</p>
            <p className="text-green-100">{info}</p>
          </div>
        </div>
        <a href={downloadUrl} download={filename}>
          <Button
            variant="secondary"
            size="lg"
            className="bg-white text-emerald-600 hover:bg-green-50 px-8 py-6 text-lg font-bold shadow-xl hover:scale-105 transition-transform"
          >
            <Download className="w-6 h-6" />
            ดาวน์โหลด .srt
          </Button>
        </a>
      </div>
    </div>
  );
}
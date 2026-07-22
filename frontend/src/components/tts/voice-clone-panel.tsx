"use client";

import { useRef, useState } from "react";
import { Upload, Mic2, X } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";

interface Props {
  refAudio: File | null;
  onRefAudio: (f: File | null) => void;
  refText: string;
  onRefText: (t: string) => void;
}

export function VoiceClonePanel({ refAudio, onRefAudio, refText, onRefText }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  return (
    <div className="rounded-2xl p-4 md:p-5 bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40 mb-4 space-y-3">
      <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">
        🎤 Voice Cloning — อัปโหลดเสียงตัวอย่าง (3-10 วินาที)
      </p>

      {/* Drop zone เล็ก */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) onRefAudio(f); }}
        className={cn(
          "flex items-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all",
          "border-orange-200 bg-white/60 dark:bg-slate-800/40 hover:border-orange-400",
          drag && "border-orange-500 bg-orange-100/60"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onRefAudio(f); }}
        />
        {refAudio ? (
          <>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-md ring-1 ring-inset ring-white/30">
              <Mic2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{refAudio.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(refAudio.size)}</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRefAudio(null); }}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <Upload className="w-5 h-5 text-slate-500 dark:text-slate-300" />
            </div>
            <p className="text-sm text-muted-foreground">คลิกหรือลากไฟล์เสียงมาวาง (.wav/.mp3/.m4a)</p>
          </>
        )}
      </div>

      {/* ref text */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
          คำถอดความของเสียงตัวอย่าง <span className="font-normal">(เว้นว่าง = ให้ AI ถอดความเอง)</span>
        </label>
        <input
          type="text"
          value={refText}
          onChange={(e) => onRefText(e.target.value)}
          placeholder="เช่น Hello, this is my voice."
          className="w-full h-11 px-3 rounded-xl border-2 border-input bg-background text-sm text-foreground focus:outline-none focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/30 focus:border-orange-500 transition-all"
        />
      </div>
    </div>
  );
}
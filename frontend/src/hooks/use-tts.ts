"use client";

import { useState, useCallback } from "react";
import { ProcessStatus } from "@/lib/types";
import { useSound } from "./use-sound";

export interface TTSParams {
  text: string;
  mode: "auto" | "design" | "clone";
  instruct?: string;
  refText?: string;
  refAudio?: File | null;
  speed: number;
  numStep: number;
}

interface UseTTSReturn {
  status: ProcessStatus;
  audioUrl: string | null;
  audioFilename: string;
  generate: (p: TTSParams) => Promise<void>;
  reset: () => void;
}

export function useTTS(): UseTTSReturn {
  const [status, setStatus] = useState<ProcessStatus>({ state: "idle", progress: 0, message: "" });
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioFilename, setAudioFilename] = useState("tts.wav");
  const { playSuccess } = useSound();

  const reset = useCallback(() => {
    setStatus({ state: "idle", progress: 0, message: "" });
    setAudioUrl(null);
  }, []);

  const generate = useCallback(
    async (p: TTSParams) => {
      setStatus({ state: "processing", progress: 30, message: "🔊 กำลังสร้างเสียง... (ครั้งแรกจะโหลดโมเดล)" });
      setAudioUrl(null);

      try {
        const fd = new FormData();
        fd.append("text", p.text);
        fd.append("mode", p.mode);
        fd.append("speed", String(p.speed));
        fd.append("num_step", String(p.numStep));
        if (p.mode === "design" && p.instruct) fd.append("instruct", p.instruct);
        if (p.mode === "clone") {
          if (p.refAudio) fd.append("ref_audio", p.refAudio);
          if (p.refText) fd.append("ref_text", p.refText);
        }

        const res = await fetch("/api/tts", { method: "POST", body: fd });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ detail: res.statusText }));
          throw new Error(err.detail || `HTTP ${res.status}`);
        }

        setStatus((s) => ({ ...s, progress: 90, message: "✅ กำลังเตรียมไฟล์เสียง..." }));
        playSuccess();

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        // ดึงชื่อจาก Content-Disposition ถ้ามี
        const cd = res.headers.get("content-disposition") || "";
        const m = cd.match(/filename="?([^";]+)"?/);
        setAudioUrl(url);
        setAudioFilename(m ? m[1] : "tts.wav");
        setStatus({ state: "success", progress: 100, message: "สร้างเสียงเสร็จสมบูรณ์" });
      } catch (error: any) {
        setStatus({ state: "error", progress: 0, message: `❌ ${error.message}` });
      }
    },
    [playSuccess]
  );

  return { status, audioUrl, audioFilename, generate, reset };
}
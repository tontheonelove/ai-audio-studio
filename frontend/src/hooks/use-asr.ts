"use client";

import { useState, useCallback } from "react";
import { ProcessStatus } from "@/lib/types";
import { useSound } from "./use-sound";

export interface AsrTimestamp {
  text: string;
  start: number;
  end: number;
}

export interface AsrResult {
  text: string;
  language: string;
  timestamps: AsrTimestamp[];
}

export interface AsrParams {
  file?: File | null;
  url?: string;
  language: string;
}

interface UseAsrReturn {
  status: ProcessStatus;
  result: AsrResult | null;
  transcribe: (p: AsrParams) => Promise<void>;
  freeMemory: () => Promise<string>;
  reset: () => void;
}

export function useAsr(): UseAsrReturn {
  const [status, setStatus] = useState<ProcessStatus>({ state: "idle", progress: 0, message: "" });
  const [result, setResult] = useState<AsrResult | null>(null);
  const { playSuccess } = useSound();

  const reset = useCallback(() => {
    setStatus({ state: "idle", progress: 0, message: "" });
    setResult(null);
  }, []);

  const transcribe = useCallback(
    async (p: AsrParams) => {
      setStatus({ state: "processing", progress: 25, message: "🎙️ กำลังถอดความ..." });
      setResult(null);
      try {
        const fd = new FormData();
        if (p.file) fd.append("file", p.file);
        if (p.url) fd.append("url", p.url);
        fd.append("language", p.language);

        const res = await fetch("/api/asr", { method: "POST", body: fd });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ detail: res.statusText }));
          throw new Error(err.detail || `HTTP ${res.status}`);
        }
        setStatus((s) => ({ ...s, progress: 90, message: "✅ กำลังจัดรูปแบบ..." }));
        const data: AsrResult = await res.json();
        playSuccess();
        setResult(data);
        setStatus({ state: "success", progress: 100, message: "ถอดความเสร็จสมบูรณ์" });
      } catch (error: any) {
        setStatus({ state: "error", progress: 0, message: `❌ ${error.message}` });
      }
    },
    [playSuccess]
  );

  const freeMemory = useCallback(async () => {
    try {
      const res = await fetch("/api/unload-others", { method: "POST" });
      const data = await res.json().catch(() => null);
      return data?.message || "ส่งคำสั่งแล้ว";
    } catch {
      return "⚠️ เรียกไม่ได้";
    }
  }, []);

  return { status, result, transcribe, freeMemory, reset };
}
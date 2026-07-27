"use client";

import { useState, useCallback } from "react";
import { ProcessStatus } from "@/lib/types";
import { useSound } from "./use-sound";

export interface TranscribeParams {
  file?: File | null;
  url?: string;
  sourceLang: string;
  targetLang: string;
}

interface UseTranscribeReturn {
  status: ProcessStatus;
  downloadUrl: string | null;
  downloadFilename: string;
  transcribe: (p: TranscribeParams) => Promise<void>;
  reset: () => void;
}

export function useTranscribe(): UseTranscribeReturn {
  const [status, setStatus] = useState<ProcessStatus>({ state: "idle", progress: 0, message: "" });
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState("subtitle.srt");
  const { playSuccess } = useSound();

  const reset = useCallback(() => {
    setStatus({ state: "idle", progress: 0, message: "" });
    setDownloadUrl(null);
  }, []);

  const transcribe = useCallback(
    async (p: TranscribeParams) => {
      setStatus({ state: "processing", progress: 20, message: "🌐 กำลังถอดความ + แปลภาษา..." });
      setDownloadUrl(null);
      try {
        const fd = new FormData();
        if (p.file) fd.append("file", p.file);
        if (p.url) fd.append("url", p.url);
        fd.append("source_lang", p.sourceLang);
        fd.append("target_lang", p.targetLang);

        const endpoint = p.file ? "/api/transcribe" : "/api/transcribe-url";
        const res = await fetch(endpoint, { method: "POST", body: fd });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ detail: res.statusText }));
          throw new Error(err.detail || `HTTP ${res.status}`);
        }

        setStatus((s) => ({ ...s, progress: 90, message: "✅ กำลังเตรียมไฟล์ซับ..." }));
        playSuccess();

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const cd = res.headers.get("content-disposition") || "";
        const m = cd.match(/filename="?([^";]+)"?/);
        setDownloadUrl(url);
        setDownloadFilename(m ? decodeURIComponent(m[1]) : "subtitle.srt");
        setStatus({ state: "success", progress: 100, message: "แปลซับเสร็จสมบูรณ์" });
      } catch (error: any) {
        setStatus({ state: "error", progress: 0, message: `❌ ${error.message}` });
      }
    },
    [playSuccess]
  );

  return { status, downloadUrl, downloadFilename, transcribe, reset };
}
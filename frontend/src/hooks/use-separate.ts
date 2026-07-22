"use client";

import { useState, useCallback } from "react";
import { ProcessStatus } from "@/lib/types";
import { useSound } from "./use-sound";

export interface SeparateParams {
  file?: File | null;
  url?: string;
  modelFilename: string;
  outputFormat: string;
  singleStem: string;
}

interface UseSeparateReturn {
  status: ProcessStatus;
  downloadUrl: string | null;
  downloadFilename: string;
  separate: (p: SeparateParams) => Promise<void>;
  reset: () => void;
}

export function useSeparate(): UseSeparateReturn {
  const [status, setStatus] = useState<ProcessStatus>({ state: "idle", progress: 0, message: "" });
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState("separated.zip");
  const { playSuccess } = useSound();

  const reset = useCallback(() => {
    setStatus({ state: "idle", progress: 0, message: "" });
    setDownloadUrl(null);
  }, []);

  const separate = useCallback(
    async (p: SeparateParams) => {
      setStatus({ state: "processing", progress: 20, message: "🎵 กำลังแยกเสียง... (ครั้งแรกโหลดโมเดล)" });
      setDownloadUrl(null);
      try {
        const fd = new FormData();
        if (p.file) fd.append("file", p.file);
        if (p.url) fd.append("url", p.url);
        fd.append("model_filename", p.modelFilename);
        fd.append("output_format", p.outputFormat);
        fd.append("single_stem", p.singleStem);

        const res = await fetch("/api/separate", { method: "POST", body: fd });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ detail: res.statusText }));
          throw new Error(err.detail || `HTTP ${res.status}`);
        }

        setStatus((s) => ({ ...s, progress: 90, message: "✅ กำลังเตรียมไฟล์..." }));
        playSuccess();

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const cd = res.headers.get("content-disposition") || "";
        const m = cd.match(/filename="?([^";]+)"?/);
        setDownloadUrl(url);
        setDownloadFilename(m ? m[1] : "separated.zip");
        setStatus({ state: "success", progress: 100, message: "แยกเสียงเสร็จสมบูรณ์" });
      } catch (error: any) {
        setStatus({ state: "error", progress: 0, message: `❌ ${error.message}` });
      }
    },
    [playSuccess]
  );

  return { status, downloadUrl, downloadFilename, separate, reset };
}
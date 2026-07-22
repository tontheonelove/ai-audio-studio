"use client";

import { useState, useCallback } from "react";
import { ProcessStatus } from "@/lib/types";
import { API_ENDPOINTS } from "@/lib/constants";
import { useSound } from "./use-sound";
import { extractNameFromUrl } from "@/lib/utils";

interface UseTranscribeReturn {
  status: ProcessStatus;
  downloadUrl: string | null;
  downloadFilename: string;
  processFile: (file: File, sourceLang: string) => Promise<void>;
  processUrl: (url: string, sourceLang: string) => Promise<void>;
  reset: () => void;
}

export function useTranscribe(): UseTranscribeReturn {
  const [status, setStatus] = useState<ProcessStatus>({
    state: "idle",
    progress: 0,
    message: "",
  });
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState("subtitle_TH.srt");
  const { playSuccess } = useSound();

  const reset = useCallback(() => {
    setStatus({ state: "idle", progress: 0, message: "" });
    setDownloadUrl(null);
  }, []);

  const processFile = useCallback(
    async (file: File, sourceLang: string) => {
      setStatus({
        state: "processing",
        progress: 15,
        message: `⏳ กำลังถอดความ & แปลภาษา...`,
      });
      setDownloadUrl(null);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("source_lang", sourceLang);

        const response = await fetch(API_ENDPOINTS.TRANSCRIBE_FILE, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({
            detail: response.statusText,
          }));
          throw new Error(errData.detail || `HTTP ${response.status}`);
        }

        setStatus((prev) => ({
          ...prev,
          progress: 90,
          message: "✅ เสร็จสิ้น! กำลังเตรียมไฟล์...",
        }));

        playSuccess();

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const baseName = file.name.replace(/\.[^/.]+$/, "");

        setDownloadUrl(url);
        setDownloadFilename(`${baseName}.srt`);
        setStatus({ state: "success", progress: 100, message: "เสร็จสมบูรณ์" });
      } catch (error: any) {
        setStatus({
          state: "error",
          progress: 0,
          message: `❌ ${error.message}`,
        });
      }
    },
    [playSuccess]
  );

  const processUrl = useCallback(
    async (url: string, sourceLang: string) => {
      setStatus({
        state: "processing",
        progress: 10,
        message: "📥 กำลังดาวน์โหลดจากลิงก์...",
      });
      setDownloadUrl(null);

      try {
        const formData = new FormData();
        formData.append("url", url);
        formData.append("source_lang", sourceLang);

        const response = await fetch(API_ENDPOINTS.TRANSCRIBE_URL, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({
            detail: response.statusText,
          }));
          throw new Error(errData.detail || `HTTP ${response.status}`);
        }

        setStatus((prev) => ({
          ...prev,
          progress: 90,
          message: "✅ เสร็จสิ้น! กำลังเตรียมไฟล์...",
        }));

        playSuccess();

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        setDownloadUrl(blobUrl);
        const urlName = extractNameFromUrl(url);
        setDownloadFilename(`${urlName}.srt`);
        setStatus({ state: "success", progress: 100, message: "เสร็จสมบูรณ์" });
      } catch (error: any) {
        setStatus({
          state: "error",
          progress: 0,
          message: `❌ ${error.message}`,
        });
      }
    },
    [playSuccess]
  );

  return { status, downloadUrl, downloadFilename, processFile, processUrl, reset };
}
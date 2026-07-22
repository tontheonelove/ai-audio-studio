import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * ดึงชื่อไฟล์จาก URL (YouTube video ID / ชื่อไฟล์จาก path)
 * เช่น:
 *   https://www.youtube.com/shorts/1FYhrJ4QbxE?feature=share → "1FYhrJ4QbxE"
 *   https://example.com/audio/meeting.mp3 → "meeting"
 */
export function extractNameFromUrl(url: string): string {
  try {
    // YouTube: watch?v=ID, shorts/ID, youtu.be/ID, embed/ID
    const ytMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch) return ytMatch[1];

    // Direct file URL: เอาชื่อไฟล์จาก path (ตัด extension)
    const parsed = new URL(url);
    const pathSegments = parsed.pathname.split("/").filter(Boolean);
    if (pathSegments.length > 0) {
      const lastSegment = pathSegments[pathSegments.length - 1];
      const nameWithoutExt = lastSegment.replace(/\.[^/.]+$/, "");
      if (nameWithoutExt) return nameWithoutExt;
    }

    // Fallback: hostname + timestamp
    return `${parsed.hostname.replace(/^www\./, "")}_${Date.now()}`;
  } catch {
    return `subtitle_${Date.now()}`;
  }
}

/** format วินาที → HH:MM:SS,mmm (มาตรฐาน SRT) */
export function formatSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const ss = s.toFixed(3).padStart(6, "0"); // 00.000
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${ss.replace(".", ",")}`;
}

/** ประกอบ .srt จาก timestamps ของ Qwen3-ASR */
export function buildSrtFromTimestamps(
  timestamps: { text: string; start: number; end: number }[]
): string {
  return timestamps
    .map(
      (t, i) =>
        `${i + 1}\n${formatSrtTime(t.start)} --> ${formatSrtTime(t.end)}\n${t.text.trim()}\n`
    )
    .join("\n");
}

/** trigger ดาวน์โหลดไฟล์ text จาก browser */
export function downloadText(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
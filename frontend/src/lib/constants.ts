import { LanguageOption } from "./types";

export const LANGUAGES: LanguageOption[] = [
  { value: "auto", label: "ตรวจจับอัตโนมัติ (แนะนำ • แม่นยำสุด)", flag: "🌍" },
  { value: "en", label: "อังกฤษ (English)", flag: "🇬🇧" },
  { value: "ko", label: "เกาหลี (Korean)", flag: "🇰🇷" },
  { value: "ja", label: "ญี่ปุ่น (Japanese)", flag: "🇯🇵" },
  { value: "zh", label: "จีน (Chinese)", flag: "🇨🇳" },
  { value: "fr", label: "ฝรั่งเศส (French)", flag: "🇫🇷" },
  { value: "de", label: "เยอรมัน (German)", flag: "🇩🇪" },
  { value: "es", label: "สเปน (Spanish)", flag: "🇪🇸" },
  { value: "th", label: "ไทย (ถอดความอย่างเดียว ไม่แปล)", flag: "🇹🇭" },
];

export const ACCEPTED_FILE_TYPES = ".mp3,.wav,.mp4,.mkv,.flac,.m4a,.ogg,.webm";
export const MAX_FILE_SIZE_MB = 500;

export const API_ENDPOINTS = {
  TRANSCRIBE_FILE: "/api/transcribe",
  TRANSCRIBE_URL: "/api/transcribe-url",
} as const;


// ============================================================
// 🎙️ OmniVoice TTS — Voice Design options
// ============================================================
export type TTSMode = "auto" | "design" | "clone";

export interface TTSVoiceDesign {
  gender: string;
  age: string;
  pitch: string;
  style: string;
  accent: string;
}

export const EMPTY_VOICE_DESIGN: TTSVoiceDesign = {
  gender: "",
  age: "",
  pitch: "",
  style: "",
  accent: "",
};

export const TTS_GENDERS = [
  { value: "", label: "— ไม่ระบุ —" },
  { value: "male", label: "👨 ชาย (Male)" },
  { value: "female", label: "👩 หญิง (Female)" },
];

export const TTS_AGES = [
  { value: "", label: "— ไม่ระบุ —" },
  { value: "child", label: "เด็ก (Child)" },
  { value: "teenager", label: "วัยรุ่น (Teen)" },
  { value: "young adult", label: "วัยหนุ่มสาว (Young Adult)" },
  { value: "middle-aged", label: "วัยกลางคน (Middle-aged)" },
  { value: "elderly", label: "ผู้สูงอายุ (Elderly)" },
];

export const TTS_PITCHES = [
  { value: "", label: "— ไม่ระบุ —" },
  { value: "very low", label: "ต่ำมาก (Very Low)" },
  { value: "low", label: "ต่ำ (Low)" },
  { value: "medium", label: "กลาง (Medium)" },
  { value: "high", label: "สูง (High)" },
  { value: "very high", label: "สูงมาก (Very High)" },
];

export const TTS_STYLES = [
  { value: "", label: "ปกติ (Normal)" },
  { value: "whisper", label: "🤫 กระซิบ (Whisper)" },
];

export const TTS_ACCENTS = [
  { value: "", label: "— ไม่ระบุ —" },
  { value: "American accent", label: "🇺🇸 American" },
  { value: "British accent", label: "🇬🇧 British" },
  { value: "Australian accent", label: "🇦🇺 Australian" },
  { value: "Indian accent", label: "🇮 Indian" },
];

/** ประกอบ Voice Design object → instruct string (คั่นด้วย ,) */
export function buildInstruct(d: TTSVoiceDesign): string {
  return [d.gender, d.age, d.pitch, d.style, d.accent]
    .filter(Boolean)
    .join(", ");
}

export const TTS_NUM_STEPS = [
  { value: 16, label: "16 steps (เร็ว ⚡)" },
  { value: 32, label: "32 steps (คุณภาพ 🎯)" },
];

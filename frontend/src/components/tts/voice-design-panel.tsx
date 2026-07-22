"use client";

import { TTSVoiceDesign, TTS_GENDERS, TTS_AGES, TTS_PITCHES, TTS_STYLES, TTS_ACCENTS } from "@/lib/constants";

interface Props {
  value: TTSVoiceDesign;
  onChange: (v: TTSVoiceDesign) => void;
}

const selectCls =
  "w-full h-11 px-3 rounded-xl border-2 border-input bg-background text-sm text-foreground focus:outline-none focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/30 focus:border-orange-500 transition-all";

function Field({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{label}</label>
      <select className={selectCls} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export function VoiceDesignPanel({ value, onChange }: Props) {
  const set = (k: keyof TTSVoiceDesign) => (v: string) => onChange({ ...value, [k]: v });

  return (
    <div className="rounded-2xl p-4 md:p-5 bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40 mb-4">
      <p className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-3">
        🎨 ออกแบบเสียง (Voice Design) — เลือกคุณสมบัติที่ต้องการ
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Field label="เพศ" value={value.gender} options={TTS_GENDERS} onChange={set("gender")} />
        <Field label="วัย" value={value.age} options={TTS_AGES} onChange={set("age")} />
        <Field label="ระดับเสียง" value={value.pitch} options={TTS_PITCHES} onChange={set("pitch")} />
        <Field label="สไตล์" value={value.style} options={TTS_STYLES} onChange={set("style")} />
        <Field label="สำเนียงอังกฤษ" value={value.accent} options={TTS_ACCENTS} onChange={set("accent")} />
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        💡 เว้นว่างทั้งหมด = ให้โมเดลเลือกเสียงเอง • รองรับเฉพาะข้อความจีน/อังกฤษจะเสถียรสุด
      </p>
    </div>
  );
}
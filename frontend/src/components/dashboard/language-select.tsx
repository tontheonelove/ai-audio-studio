"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGES } from "@/lib/constants";

interface LanguageSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function LanguageSelect({ value, onValueChange }: LanguageSelectProps) {
  return (
    <div className="mb-6">
      <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-3 text-lg">
        🌍 เลือกภาษาต้นฉบับ
      </label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="เลือกภาษา" />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang.value} value={lang.value}>
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground mt-2">
        💡 หากไม่แน่ใจภาษา ให้เลือก &quot;ตรวจจับอัตโนมัติ&quot;
      </p>
    </div>
  );
}
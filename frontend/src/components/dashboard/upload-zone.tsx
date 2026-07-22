"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileAudio } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { ACCEPTED_FILE_TYPES } from "@/lib/constants";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

export function UploadZone({ onFileSelect, selectedFile }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleClick = () => inputRef.current?.click();

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative rounded-2xl p-6 md:p-8 text-center cursor-pointer mb-4 overflow-hidden transition-all duration-300",
        // ✨ มิติ: inset highlight + shadow นุ่ม
        "border-2 border-dashed border-orange-200 bg-gradient-to-br from-orange-50/60 to-amber-50/40 shadow-sm",
        "hover:border-orange-400 hover:from-orange-100/70 hover:to-amber-100/50 hover:scale-[1.01] hover:shadow-lg hover:shadow-orange-500/15",
        isDragOver && "border-orange-500 from-orange-100/80 to-amber-100/60 scale-[1.01] shadow-lg shadow-orange-500/20",
        "dark:border-white/15 dark:from-slate-800/30 dark:to-slate-800/10",
        "dark:hover:border-orange-400/60 dark:hover:from-orange-950/30 dark:hover:to-slate-800/20"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={ACCEPTED_FILE_TYPES}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
      />

      <div className="shimmer-overlay absolute inset-0 pointer-events-none" />

      {!selectedFile ? (
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-14 h-14 md:w-16 md:h-16 mb-3 bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/40 ring-1 ring-inset ring-white/30">
            <Upload className="w-7 h-7 md:w-8 md:h-8 text-white" />
          </div>
          <p className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-1">
            ลากไฟล์มาวางที่นี่
          </p>
          <p className="text-sm text-slate-600 dark:text-white/80 mb-2">
            หรือ{" "}
            <span className="font-semibold underline text-orange-600 dark:text-orange-400">
              คลิกเพื่อเลือกไฟล์
            </span>
          </p>
          <p className="text-xs text-slate-500 dark:text-white/60 bg-white/70 dark:bg-white/10 inline-block px-3 py-1 rounded-full">
            ขนาดแนะนำ: &lt; 500MB
          </p>
        </div>
      ) : (
        <div className="relative z-10 flex items-center justify-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg ring-1 ring-inset ring-white/30">
            <FileAudio className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <p className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
              {selectedFile.name}
            </p>
            <p className="text-sm text-slate-500 dark:text-white/70">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
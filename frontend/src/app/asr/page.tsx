"use client";

import { useState } from "react";
import { Captions, Zap, Sparkles, Copy, Download, FileText, Trash2, CheckCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusPanel } from "@/components/dashboard/status-panel";
import { UploadZone } from "@/components/dashboard/upload-zone";
import { UrlInput } from "@/components/dashboard/url-input";
import { useAsr } from "@/hooks/use-asr";
import { buildSrtFromTimestamps, downloadText } from "@/lib/utils";

const ASR_LANGUAGES = [
  { value: "auto", label: "🌍 ตรวจจับอัตโนมัติ" },
  { value: "th", label: "🇹🇭 ไทย (Thai)" },
  { value: "en", label: "🇬🇧 อังกฤษ (English)" },
  { value: "ja", label: "🇯🇵 ญี่ปุ่น (Japanese)" },
  { value: "ko", label: "🇰🇷 เกาหลี (Korean)" },
  { value: "zh", label: "🇨🇳 จีน (Chinese)" },
  { value: "fr", label: "🇫🇷 ฝรั่งเศส (French)" },
  { value: "de", label: "🇩🇪 เยอรมัน (German)" },
  { value: "es", label: "🇪🇸 สเปน (Spanish)" },
  { value: "vi", label: "🇻🇳 เวียดนาม (Vietnamese)" },
  { value: "id", label: "🇮🇩 อินโดนีเซีย (Indonesian)" },
  { value: "ru", label: "🇷🇺 รัสเซีย (Russian)" },
  { value: "ar", label: "🇸🇦 อาหรับ (Arabic)" },
  { value: "hi", label: "🇮🇳 ฮินดี (Hindi)" },
];

const selectCls =
  "w-full h-12 px-3 rounded-xl border-2 border-input bg-background text-sm text-foreground focus:outline-none focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/30 focus:border-orange-500 transition-all";

export default function AsrPage() {
  const [activeTab, setActiveTab] = useState<"file" | "url">("file");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("auto");
  const [copied, setCopied] = useState(false);

  const { status, result, transcribe, freeMemory, reset } = useAsr();

  const canRun =
    status.state !== "processing" &&
    ((activeTab === "file" && file !== null) || (activeTab === "url" && url.trim().length > 0));

  const handleRun = () => {
    transcribe({
      file: activeTab === "file" ? file : null,
      url: activeTab === "url" ? url.trim() : "",
      language,
    });
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleFreeMemory = async () => {
    const msg = await freeMemory();
    alert(msg);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 ring-1 ring-inset ring-white/30">
          <Captions className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Speech-to-Text</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Whisper AI • ถอดเสียงเป็นข้อความ • 99 ภาษา • Timestamps
          </p>
        </div>
      </div>

      <Card className="glass transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl">
        <CardContent className="p-5 md:p-8">
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => { setActiveTab(v as "file" | "url"); reset(); }}
            className="mb-4"
          >
            <div className="flex justify-center">
              <TabsList>
                <TabsTrigger value="file">📁 อัปโหลดไฟล์</TabsTrigger>
                <TabsTrigger value="url">🔗 ใส่ลิงก์ (YouTube/MP3)</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="file">
              <UploadZone onFileSelect={(f) => { setFile(f); reset(); }} selectedFile={file} />
            </TabsContent>
            <TabsContent value="url">
              <UrlInput value={url} onChange={setUrl} />
            </TabsContent>
          </Tabs>

          {/* Language select */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-foreground mb-2">🌍 ภาษา</label>
            <select className={selectCls} value={language} onChange={(e) => setLanguage(e.target.value)}>
              {ASR_LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              💡 Whisper รองรับ 99 ภาษา • เลือก "ตรวจจับอัตโนมัติ" ถ้าไม่แน่ใจ
            </p>
          </div>

          {/* Free memory button */}
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFreeMemory}
              className="gap-2 border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300"
            >
              <Trash2 className="w-4 h-4" />
              🧹 Free GPU Memory
            </Button>
          </div>

          {/* Run button */}
          <Button
            variant="gradient"
            size="lg"
            className="w-full mb-4"
            disabled={!canRun}
            onClick={handleRun}
          >
            {status.state === "processing" ? <Sparkles className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
            {status.state === "processing" ? "กำลังถอดความ..." : "ถอดความ (Speech-to-Text)"}
          </Button>

          <StatusPanel status={status} />

          {/* Result */}
          {result && (
            <div className="rounded-2xl p-5 md:p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-slate-900/30 border border-blue-200 dark:border-blue-900/40 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">🎯 ผลลัพธ์</span>
                  <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                    {result.language.toUpperCase()}
                  </span>
                  {result.timestamps.length > 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                      ⏱️ {result.timestamps.length} segments
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
                    {copied ? <CheckCheck className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? "คัดลอกแล้ว" : "คัดลอก"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadText("transcript.txt", result.text)}
                    className="gap-1.5"
                  >
                    <FileText className="w-4 h-4" /> .txt
                  </Button>
                  {result.timestamps.length > 0 && (
                    <Button
                      variant="gradient"
                      size="sm"
                      onClick={() => downloadText("transcript.srt", buildSrtFromTimestamps(result.timestamps), "application/x-subrip")}
                      className="gap-1.5"
                    >
                      <Download className="w-4 h-4" /> .srt
                    </Button>
                  )}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-900/50 border border-blue-100 dark:border-slate-700 max-h-72 overflow-y-auto">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                  {result.text || "(ไม่พบข้อความ)"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
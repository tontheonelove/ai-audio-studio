"use client";

import { useState } from "react";
import { Languages, Zap, Sparkles, Download, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusPanel } from "@/components/dashboard/status-panel";
import { UploadZone } from "@/components/dashboard/upload-zone";
import { UrlInput } from "@/components/dashboard/url-input";
import { useTranscribe } from "@/hooks/use-transcribe";

const LANGS = [
  { value: "th", label: "🇹🇭 ไทย" },
  { value: "en", label: "🇬🇧 อังกฤษ" },
  { value: "ja", label: "🇯🇵 ญี่ปุ่น" },
  { value: "ko", label: "🇰🇷 เกาหลี" },
  { value: "zh", label: "🇨 จีน" },
  { value: "fr", label: "🇫🇷 ฝรั่งเศส" },
  { value: "de", label: "🇩🇪 เยอรมัน" },
  { value: "es", label: "🇪🇸 สเปน" },
  { value: "vi", label: "🇻🇳 เวียดนาม" },
  { value: "id", label: "🇮 อินโดนีเซีย" },
  { value: "ru", label: "🇷🇺 รัสเซีย" },
  { value: "ar", label: "🇸🇦 อาหรับ" },
  { value: "hi", label: "🇮🇳 ฮินดี" },
];

const SOURCE_LANGS = [{ value: "auto", label: "🌍 ตรวจจับอัตโนมัติ" }, ...LANGS];

const selectCls =
  "w-full h-12 px-3 rounded-xl border-2 border-input bg-background text-sm text-foreground focus:outline-none focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/30 focus:border-orange-500 transition-all";

export default function TranslatorPage() {
  const [activeTab, setActiveTab] = useState<"file" | "url">("file");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("th");

  const { status, downloadUrl, downloadFilename, transcribe, reset } = useTranscribe();

  const canRun =
    status.state !== "processing" &&
    ((activeTab === "file" && file !== null) || (activeTab === "url" && url.trim().length > 0));

  const handleRun = () => {
    transcribe({
      file: activeTab === "file" ? file : null,
      url: activeTab === "url" ? url.trim() : "",
      sourceLang,
      targetLang,
    });
  };

  const handleSwap = () => {
    if (sourceLang === "auto") return;   // auto สลับไปเป็น target ไม่ได้
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  };

  const sameLang = sourceLang === targetLang;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 ring-1 ring-inset ring-white/30">
          <Languages className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">AI Translator</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Whisper + Google Translate • แปลซับได้ทุกทิศทาง • รองรับ 13 ภาษา
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

          {/* Language: จาก -> ไป */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2 md:gap-3 mb-2">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">🗣️ จาก (ต้นฉบับ)</label>
              <select className={selectCls} value={sourceLang} onChange={(e) => setSourceLang(e.target.value)}>
                {SOURCE_LANGS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <button
              type="button"
              onClick={handleSwap}
              disabled={sourceLang === "auto"}
              title={sourceLang === "auto" ? "ตรวจจับอัตโนมัติสลับไม่ได้" : "สลับ จาก/ไป"}
              className="h-12 w-10 md:w-12 rounded-xl border-2 border-input bg-background hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:border-orange-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all"
            >
              <ArrowRight className="w-5 h-5 text-orange-500" />
            </button>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">🎯 ไป (เป้าหมาย)</label>
              <select className={selectCls} value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
                {LANGS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>

          {sameLang ? (
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-4">
              ⚠️ จาก = ไป → จะถอดความอย่างเดียว (ไม่แปล) เหมาะสำหรับทำซับภาษาต้นฉบับ
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mb-4">
              💡 เลือก "ตรวจจับอัตโนมัติ" ถ้าไม่แน่ใจภาษาต้นฉบับ • ซับที่ได้จะเป็นภาษา "{LANGS.find((l) => l.value === targetLang)?.label}"
            </p>
          )}

          {/* Run button */}
          <Button
            variant="gradient"
            size="lg"
            className="w-full mb-4"
            disabled={!canRun}
            onClick={handleRun}
          >
            {status.state === "processing" ? <Sparkles className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
            {status.state === "processing" ? "กำลังแปล..." : sameLang ? "ถอดความ (ไม่แปล)" : "แปลซับไตเติ้ล"}
          </Button>

          <StatusPanel status={status} />

          {/* Download */}
          {downloadUrl && (
            <div className="rounded-2xl p-5 md:p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-slate-900/30 border border-orange-200 dark:border-orange-900/40 shadow-sm">
              <p className="text-sm font-bold text-foreground mb-3">🎉 แปลซับเสร็จแล้ว!</p>
              <a href={downloadUrl} download={downloadFilename} className="block">
                <Button variant="gradient" className="w-full gap-2">
                  <Download className="w-5 h-5" />
                  ดาวน์โหลด {downloadFilename}
                </Button>
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
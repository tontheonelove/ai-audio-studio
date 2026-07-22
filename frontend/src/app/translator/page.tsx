"use client";

import { useState } from "react";
import { Zap, Languages } from "lucide-react";
import { LanguageSelect } from "@/components/dashboard/language-select";
import { UploadZone } from "@/components/dashboard/upload-zone";
import { UrlInput } from "@/components/dashboard/url-input";
import { StatusPanel } from "@/components/dashboard/status-panel";
import { DownloadPanel } from "@/components/dashboard/download-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTranscribe } from "@/hooks/use-transcribe";
import { LANGUAGES } from "@/lib/constants";

export default function TranslatorPage() {
  const [activeTab, setActiveTab] = useState<"file" | "url">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [urlValue, setUrlValue] = useState("");
  const [sourceLang, setSourceLang] = useState("auto");

  const { status, downloadUrl, downloadFilename, processFile, processUrl, reset } =
    useTranscribe();

  const canProcess =
    (activeTab === "file" && selectedFile !== null) ||
    (activeTab === "url" && urlValue.trim().length > 0);

  const handleProcess = () => {
    if (activeTab === "file" && selectedFile) {
      processFile(selectedFile, sourceLang);
    } else if (activeTab === "url" && urlValue.trim()) {
      processUrl(urlValue.trim(), sourceLang);
    }
  };

  const langLabel =
    LANGUAGES.find((l) => l.value === sourceLang)?.label || "ต้นฉบับ";

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/40 ring-1 ring-inset ring-white/30">
          <Languages className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            AI Translator
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            แปลงเสียง/วิดีโอ เป็นซับไทยอัตโนมัติ • Whisper AI + GPU
          </p>
        </div>
      </div>

      {/* Main Card (✨ มิติ: hover ลอยขึ้น) */}
      <Card className="glass transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl">
        <CardContent className="p-5 md:p-8">
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              setActiveTab(v as "file" | "url");
              reset();
            }}
            className="mb-4"
          >
            <div className="flex justify-center">
              <TabsList>
                <TabsTrigger value="file">📁 อัปโหลดไฟล์</TabsTrigger>
                <TabsTrigger value="url">🔗 ใส่ลิงก์ (YouTube/MP3)</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="file">
              <UploadZone
                onFileSelect={(file) => {
                  setSelectedFile(file);
                  reset();
                }}
                selectedFile={selectedFile}
              />
            </TabsContent>

            <TabsContent value="url">
              <UrlInput value={urlValue} onChange={setUrlValue} />
            </TabsContent>
          </Tabs>

          {/* Language Selector */}
          <LanguageSelect value={sourceLang} onValueChange={setSourceLang} />

          {/* Process Button */}
          <Button
            variant="gradient"
            size="lg"
            className="w-full mb-4"
            disabled={!canProcess || status.state === "processing"}
            onClick={handleProcess}
          >
            <Zap
              className={`w-6 h-6 ${
                status.state === "processing" ? "animate-spin" : ""
              }`}
            />
            {status.state === "processing"
              ? activeTab === "file"
                ? "กำลังประมวลผล..."
                : "กำลังดาวน์โหลดและประมวลผล..."
              : "เริ่มสร้าง Subtitle"}
          </Button>

          {/* Status */}
          <StatusPanel status={status} />

          {/* Download */}
          <DownloadPanel
            downloadUrl={downloadUrl}
            filename={downloadFilename}
            info={
              activeTab === "file"
                ? `${selectedFile?.name || ""} • แปลจาก ${langLabel} เป็นไทย`
                : `YouTube/URL • แปลจาก ${langLabel} เป็นไทย`
            }
          />
        </CardContent>
      </Card>

      {/* ❌ FeatureCards ถูกลบออกแล้ว — หน้าเรียบสะอาด */}
    </div>
  );
}
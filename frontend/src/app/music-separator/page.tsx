"use client";

import { useState } from "react";
import { Music, Zap, Sparkles, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusPanel } from "@/components/dashboard/status-panel";
import { UploadZone } from "@/components/dashboard/upload-zone";
import { UrlInput } from "@/components/dashboard/url-input";
import { useSeparate } from "@/hooks/use-separate";

const MODELS = [
  { value: "model_bs_roformer_ep_317_sdr_12.9755.ckpt", label: "🎤 BS-Roformer (Vocal + Instrumental) — แนะนำ" },
  { value: "htdemucs_ft.yaml", label: "🥁 Demucs v4 (4 stems: Vocal/Drums/Bass/Other)" },
  { value: "htdemucs_6s.yaml", label: "🎸 Demucs 6s (6 stems: +Guitar/Piano)" },
];

const STEMS = [
  { value: "", label: "🎚️ ทุก stem (รวมเป็น ZIP)" },
  { value: "Vocals", label: "🎤 เฉพาะ Vocals (เสียงร้อง)" },
  { value: "Instrumental", label: "🎹 เฉพาะ Instrumental (ดนตรี/คาราโอเกะ)" },
];

const FORMATS = [
  { value: "WAV", label: "WAV (คุณภาพสูงสุด)" },
  { value: "MP3", label: "MP3 (ไฟล์เล็ก)" },
  { value: "FLAC", label: "FLAC (Lossless)" },
];

const selectCls =
  "w-full h-12 px-3 rounded-xl border-2 border-input bg-background text-sm text-foreground focus:outline-none focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/30 focus:border-orange-500 transition-all";

export default function MusicSeparatorPage() {
  const [activeTab, setActiveTab] = useState<"file" | "url">("file");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [modelFilename, setModelFilename] = useState(MODELS[0].value);
  const [singleStem, setSingleStem] = useState("");
  const [outputFormat, setOutputFormat] = useState("WAV");

  const { status, downloadUrl, downloadFilename, separate, reset } = useSeparate();

  const canRun =
    status.state !== "processing" &&
    ((activeTab === "file" && file !== null) || (activeTab === "url" && url.trim().length > 0));

  const handleRun = () => {
    separate({
      file: activeTab === "file" ? file : null,
      url: activeTab === "url" ? url.trim() : "",
      modelFilename,
      outputFormat,
      singleStem,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/30 ring-1 ring-inset ring-white/30">
          <Music className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Music Separator</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            UVR5 • แยกเสียงร้อง/ดนตรี • BS-Roformer + Demucs • GPU
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

          {/* Options */}
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">🧠 โมเดล</label>
              <select className={selectCls} value={modelFilename} onChange={(e) => setModelFilename(e.target.value)}>
                {MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">🎚️ Stem ที่ต้องการ</label>
              <select className={selectCls} value={singleStem} onChange={(e) => setSingleStem(e.target.value)}>
                {STEMS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">💾 รูปแบบไฟล์</label>
              <select className={selectCls} value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}>
                {FORMATS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-4">
            💡 เลือก "ทุก stem" = ดาวน์โหลด ZIP รวมทุกไฟล์ • เลือก stem เดียว = ดาวน์โหลดไฟล์นั้นโดยตรง • โมเดลจะ download อัตโนมัติครั้งแรก
          </p>

          {/* Run button */}
          <Button
            variant="gradient"
            size="lg"
            className="w-full mb-4"
            disabled={!canRun}
            onClick={handleRun}
          >
            {status.state === "processing" ? <Sparkles className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
            {status.state === "processing" ? "กำลังแยกเสียง..." : "แยกเสียง (Music Separator)"}
          </Button>

          <StatusPanel status={status} />

          {/* Download */}
          {downloadUrl && (
            <div className="rounded-2xl p-5 md:p-6 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-slate-900/30 border border-rose-200 dark:border-rose-900/40 shadow-sm">
              <p className="text-sm font-bold text-foreground mb-3">🎉 แยกเสียงเสร็จแล้ว!</p>
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
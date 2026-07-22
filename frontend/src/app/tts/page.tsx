"use client";

import { useState } from "react";
import { AudioLines, Sparkles, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusPanel } from "@/components/dashboard/status-panel";
import { VoiceDesignPanel } from "@/components/tts/voice-design-panel";
import { VoiceClonePanel } from "@/components/tts/voice-clone-panel";
import { AudioResult } from "@/components/tts/audio-result";
import { useTTS } from "@/hooks/use-tts";
import {
  TTSMode,
  TTSVoiceDesign,
  EMPTY_VOICE_DESIGN,
  TTS_NUM_STEPS,
  buildInstruct,
} from "@/lib/constants";

export default function TTSPage() {
  const [mode, setMode] = useState<TTSMode>("auto");
  const [text, setText] = useState("");
  const [design, setDesign] = useState<TTSVoiceDesign>(EMPTY_VOICE_DESIGN);
  const [refAudio, setRefAudio] = useState<File | null>(null);
  const [refText, setRefText] = useState("");
  const [speed, setSpeed] = useState(1.0);
  const [numStep, setNumStep] = useState(32);

  const { status, audioUrl, audioFilename, generate, reset } = useTTS();

  const canGenerate =
    text.trim().length > 0 &&
    status.state !== "processing" &&
    (mode !== "clone" || refAudio !== null);

  const handleGenerate = () => {
    generate({
      text: text.trim(),
      mode,
      instruct: mode === "design" ? buildInstruct(design) : undefined,
      refText: mode === "clone" ? refText : undefined,
      refAudio: mode === "clone" ? refAudio : null,
      speed,
      numStep,
    });
  };

  const switchMode = (m: TTSMode) => {
    setMode(m);
    reset();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-1 ring-inset ring-white/30">
          <AudioLines className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Text-to-Speech</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            OmniVoice • 600+ ภาษา • Voice Cloning & Design • GPU
          </p>
        </div>
      </div>

      <Card className="glass transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl">
        <CardContent className="p-5 md:p-8">
          {/* Mode Tabs */}
          <Tabs value={mode} onValueChange={(v) => switchMode(v as TTSMode)} className="mb-4">
            <div className="flex justify-center">
              <TabsList>
                <TabsTrigger value="auto">✨ Auto</TabsTrigger>
                <TabsTrigger value="design">🎨 Design</TabsTrigger>
                <TabsTrigger value="clone">🎤 Clone</TabsTrigger>
              </TabsList>
            </div>
          </Tabs>

          {/* Text input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-foreground mb-2">
              📝 ข้อความที่จะแปลงเป็นเสียง
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="พิมพ์ข้อความที่นี่... รองรับ 600+ ภาษา (ใส่ [laughter] เพิ่มเสียงหัวเราะได้)"
              className="w-full px-4 py-3 rounded-2xl border-2 border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/30 focus:border-orange-500 transition-all resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">{text.length} / 2000</p>
          </div>

          {/* Conditional panels */}
          {mode === "design" && <VoiceDesignPanel value={design} onChange={setDesign} />}
          {mode === "clone" && (
            <VoiceClonePanel
              refAudio={refAudio}
              onRefAudio={setRefAudio}
              refText={refText}
              onRefText={setRefText}
            />
          )}

          {/* Controls: speed + steps */}
          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                ⚡ ความเร็ว: <span className="text-orange-600 dark:text-orange-400">{speed.toFixed(1)}x</span>
              </label>
              <input
                type="range"
                min={0.5}
                max={2.0}
                step={0.1}
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full accent-orange-500"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0.5x</span><span>1.0x</span><span>2.0x</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">🎯 คุณภาพ</label>
              <select
                value={numStep}
                onChange={(e) => setNumStep(parseInt(e.target.value))}
                className="w-full h-11 px-3 rounded-xl border-2 border-input bg-background text-sm text-foreground focus:outline-none focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/30 focus:border-orange-500 transition-all"
              >
                {TTS_NUM_STEPS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Generate button */}
          <Button
            variant="gradient"
            size="lg"
            className="w-full mb-4"
            disabled={!canGenerate}
            onClick={handleGenerate}
          >
            {status.state === "processing" ? (
              <Sparkles className="w-6 h-6 animate-spin" />
            ) : (
              <Zap className="w-6 h-6" />
            )}
            {status.state === "processing" ? "กำลังสร้างเสียง..." : "สร้างเสียง"}
          </Button>

          {/* Status */}
          <StatusPanel status={status} />

          {/* Audio result */}
          <AudioResult audioUrl={audioUrl} filename={audioFilename} />
        </CardContent>
      </Card>
    </div>
  );
}
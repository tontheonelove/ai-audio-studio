# ============================================================
# ⚡ [1] เปิด CUDA DLL ให้ ctranslate2/faster-whisper หาเจอ (Windows)
# ============================================================
import os
import sys


def _enable_cuda_dlls():
    if sys.platform != "win32":
        return
    try:
        import nvidia
        base = nvidia.__path__[0]
        added = []
        for sub in os.listdir(base):
            bin_dir = os.path.join(base, sub, "bin")
            if os.path.isdir(bin_dir):
                try:
                    os.add_dll_directory(bin_dir)
                    added.append(sub)
                except OSError:
                    pass
        os.environ["PATH"] = base + os.pathsep + os.environ.get("PATH", "")
        print(f"⚡ [CUDA DLL] เพิ่ม dll directory จาก torch: {added}")
    except Exception as e:
        print(f"⚠️ [CUDA DLL] ข้าม torch wheel: {e}")

    try:
        import ctranslate2
        n_gpu = ctranslate2.get_cuda_device_count()
        print(f"🔍 [ctranslate2] version={ctranslate2.__version__} | CUDA devices={n_gpu}")
        if n_gpu == 0:
            print("⚠️ [ctranslate2] ไม่เห็น GPU! → จะ fallback CPU")
    except Exception as e:
        print(f"⚠️ [ctranslate2] ตรวจไม่เจอ: {e}")


_enable_cuda_dlls()

# 🎥 เพิ่ม ffmpeg ใน PATH (ให้ audio-separator หาเจอ)
_ffmpeg_dir = os.getcwd()
if os.path.exists(os.path.join(_ffmpeg_dir, "ffmpeg.exe")):
    os.environ["PATH"] = _ffmpeg_dir + os.pathsep + os.environ.get("PATH", "")
    print(f"🎥 [FFmpeg] เพิ่ม {_ffmpeg_dir} เข้า PATH")

# 🌐 [1.5] กันโหลดโมเดลจาก HuggingFace ไม่ได้/ช้า
os.environ.setdefault("HF_ENDPOINT", "https://hf-mirror.com")
# ============================================================

# ============================================================
# Imports หลัก
# ============================================================
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import re
import gc
import time
import tempfile
import torch
import asyncio
import subprocess
import uuid
import shutil
import zipfile
import glob
import soundfile as sf
from urllib.parse import urlparse
from faster_whisper import WhisperModel
from deep_translator import GoogleTranslator

# 🧹 Cleanup ไฟล์ temp ค้างจาก session ก่อนหน้า (ตอน start)

_old_temp_dirs = glob.glob(os.path.join(tempfile.gettempdir(), "tmp*"))
for d in _old_temp_dirs:
    try:
        if os.path.isdir(d) and os.path.getmtime(d) < time.time() - 3600:  # เก่าเกิน 1 ชม.
            shutil.rmtree(d)
            print(f"🧹 [Startup Cleanup] ลบโฟลเดอร์ temp เก่า: {d}")
    except Exception:
        pass

# ✅ สร้าง App Instance
app = FastAPI(title="AI Studio Backend — Translator + TTS + Whisper STT + Music Separator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = None              # Whisper (ใช้ทั้ง Translator + STT)
tts_model = None          # OmniVoice TTS
separator_instance = None # UVR5 Music Separator


# ============================================================
# [3] Helper functions
# ============================================================
def cleanup(paths):
    """ลบไฟล์/โฟลเดอร์ชั่วคราว (รองรับทั้ง file + directory)"""
    for p in paths:
        try:
            if os.path.isdir(p):
                shutil.rmtree(p)
            elif os.path.exists(p):
                os.remove(p)
        except Exception as e:
            print(f"Warning: Could not remove {p}: {e}")


def _free_cuda():
    """คืน VRAM ให้โล่ง (เรียกก่อนโหลดโมเดลหนัก / ตอนกด Free Memory)"""
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()


def load_model():
    """Whisper — lazy load (ใช้ทั้ง Translator + STT)"""
    global model
    if model is not None:
        return model
    cuda_ok = torch.cuda.is_available()
    gpu_name = torch.cuda.get_device_name(0) if cuda_ok else "None"
    print(f"🔍 [GPU Check] torch.cuda={cuda_ok} | GPU={gpu_name}")
    if cuda_ok:
        for ctype in ("float16", "int8"):
            try:
                print(f"⚡ [Model] กำลังโหลด Whisper (cuda + {ctype})...")
                model = WhisperModel("small", device="cuda", compute_type=ctype)
                print(f"✅ [Model] โหลดสำเร็จ! ใช้ CUDA + {ctype} 🚀")
                return model
            except Exception as e:
                print(f"⚠️ [Model] cuda+{ctype} ล้มเหลว: {e}")
    print("🐢 [Model] fallback → CPU + int8")
    model = WhisperModel("small", device="cpu", compute_type="int8")
    return model


def format_srt_time(seconds: float) -> str:
    h, m, s = int(seconds // 3600), int((seconds % 3600) // 60), seconds % 60
    return f"{h:02d}:{m:02d}:{s:06.3f}".replace('.', ',')


def extract_name_from_url(url: str) -> str:
    yt_match = re.search(
        r'(?:youtube\.com/(?:watch\?v=|shorts/|embed/)|youtu\.be/)([a-zA-Z0-9_-]{11})',
        url
    )
    if yt_match:
        return yt_match.group(1)
    parsed = urlparse(url)
    path_segments = [s for s in parsed.path.split("/") if s]
    if path_segments:
        name = os.path.splitext(path_segments[-1])[0]
        if name:
            return name
    hostname = parsed.netloc.replace("www.", "") or "subtitle"
    return f"{hostname}_{int(time.time())}"


def download_audio_from_url(url: str, output_dir: str) -> str:
    parsed = urlparse(url)
    if not parsed.scheme or not parsed.netloc:
        raise HTTPException(status_code=400, detail="URL ไม่ถูกต้อง")
    unique_id = uuid.uuid4().hex
    temp_filename = os.path.join(output_dir, f"audio_{unique_id}.m4a")
    ffmpeg_path = os.path.join(os.getcwd(), "ffmpeg.exe")
    ffmpeg_arg = ["--ffmpeg-location", ffmpeg_path] if os.path.exists(ffmpeg_path) else []
    try:
        print(f"📥 [DEBUG] กำลังดาวน์โหลด: {url}")
        cmd = [
            sys.executable, "-m", "yt_dlp", "-x", "--audio-format", "m4a",
            "--output", temp_filename, "--no-playlist", "--quiet",
            "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "--socket-timeout", "10", "--js-runtimes", "node",
        ] + ffmpeg_arg + [url]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
        if result.returncode != 0:
            error_msg = result.stderr.strip()
            print(f"❌ [ERROR] yt-dlp failed: {error_msg}")
            if "JavaScript runtime" in error_msg:
                print("⚠️ ลอง Legacy Mode...")
                cmd_legacy = [
                    sys.executable, "-m", "yt_dlp", "-x", "--audio-format", "m4a",
                    "--output", temp_filename, "--no-playlist", "--quiet",
                    "--user-agent", "Mozilla/5.0", "--socket-timeout", "10",
                    "--extractor-args", "youtube:player_client=web_embedded",
                ] + ffmpeg_arg + [url]
                result = subprocess.run(cmd_legacy, capture_output=True, text=True, timeout=600)
                if result.returncode != 0:
                    raise Exception(f"yt-dlp legacy error: {result.stderr.strip()}")
        if not os.path.exists(temp_filename):
            files = [f for f in os.listdir(output_dir) if f.startswith("audio_")]
            if files:
                return os.path.join(output_dir, files[0])
            raise Exception("Downloaded file not found")
        print(f"✅ [DEBUG] Download success: {temp_filename}")
        return temp_filename
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="ดาวน์โหลด Timeout")
    except Exception as e:
        print(f"❌ [EXCEPTION] Download failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"ดาวน์โหลดล้มเหลว: {str(e)}")


# ============================================================
# [4] Whisper Routes (AI Translator — ถอด + แปลเป็นไทย)
# ============================================================
@app.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    source_lang: str = Form("auto"),
    bg: BackgroundTasks = None,
):
    try:
        m = load_model()
        suffix = os.path.splitext(file.filename)[1]
        tmp_audio = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        tmp_audio.write(await file.read())
        tmp_audio.close()
        whisper_lang = None if source_lang == "auto" else source_lang
        print(f"🔍 กำลังถอดความ (โหมด: {source_lang})...")
        segments, info = m.transcribe(tmp_audio.name, language=whisper_lang, task="transcribe", beam_size=5, vad_filter=True)
        seg_list = list(segments)
        if not seg_list:
            raise HTTPException(status_code=400, detail="ไม่พบข้อความในไฟล์")
        translate_source = info.language if source_lang == "auto" else source_lang
        is_thai_source = translate_source == "th"
        translator = None if is_thai_source else GoogleTranslator(source=translate_source, target='th')
        cache = {}
        srt_lines = []
        for i, seg in enumerate(seg_list, 1):
            txt = seg.text.strip()
            if not txt:
                continue
            if is_thai_source:
                final_text = txt
            else:
                if txt in cache:
                    final_text = cache[txt]
                else:
                    try:
                        final_text = translator.translate(txt)
                        cache[txt] = final_text
                        await asyncio.sleep(0.04)
                    except Exception:
                        final_text = txt
            srt_lines.append(f"{i}\n{format_srt_time(seg.start)} --> {format_srt_time(seg.end)}\n{final_text}\n")
        tmp_srt = tempfile.NamedTemporaryFile(delete=False, suffix="_TH.srt", mode="w", encoding="utf-8")
        tmp_srt.write("\n".join(srt_lines))
        tmp_srt.close()
        bg.add_task(cleanup, [tmp_audio.name, tmp_srt.name])
        print(f"✅ เสร็จสิ้น! แปลจาก {translate_source.upper()} เป็น TH")
        out_name = f"{os.path.splitext(file.filename)[0]}.srt"
        return FileResponse(tmp_srt.name, filename=out_name, media_type="application/x-subrip")
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Backend Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/transcribe-url")
async def transcribe_url(
    url: str = Form(...),
    source_lang: str = Form("auto"),
    bg: BackgroundTasks = None,
):
    try:
        m = load_model()
        temp_dir = tempfile.mkdtemp()
        print(f"📥 กำลังดาวน์โหลดจาก: {url}")
        audio_path = download_audio_from_url(url, temp_dir)
        whisper_lang = None if source_lang == "auto" else source_lang
        print(f"🔍 กำลังถอดความ (โหมด: {source_lang})...")
        segments, info = m.transcribe(audio_path, language=whisper_lang, task="transcribe", beam_size=5, vad_filter=True)
        seg_list = list(segments)
        if not seg_list:
            raise HTTPException(status_code=400, detail="ไม่พบข้อความในไฟล์")
        translate_source = info.language if source_lang == "auto" else source_lang
        is_thai_source = translate_source == "th"
        translator = None if is_thai_source else GoogleTranslator(source=translate_source, target='th')
        cache = {}
        srt_lines = []
        for i, seg in enumerate(seg_list, 1):
            txt = seg.text.strip()
            if not txt:
                continue
            if is_thai_source:
                final_text = txt
            else:
                if txt in cache:
                    final_text = cache[txt]
                else:
                    try:
                        final_text = translator.translate(txt)
                        cache[txt] = final_text
                        await asyncio.sleep(0.04)
                    except Exception:
                        final_text = txt
            srt_lines.append(f"{i}\n{format_srt_time(seg.start)} --> {format_srt_time(seg.end)}\n{final_text}\n")
        tmp_srt = tempfile.NamedTemporaryFile(delete=False, suffix="_TH.srt", mode="w", encoding="utf-8")
        tmp_srt.write("\n".join(srt_lines))
        tmp_srt.close()
        bg.add_task(cleanup, [audio_path, tmp_srt.name])
        try:
            os.rmdir(temp_dir)
        except Exception:
            pass
        print(f"✅ เสร็จสิ้น! แปลจาก {translate_source.upper()} เป็น TH")
        srt_name = extract_name_from_url(url)
        return FileResponse(tmp_srt.name, filename=f"{srt_name}.srt", media_type="application/x-subrip")
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Backend Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# [5] OmniVoice TTS Engine
# ============================================================
def load_tts_model():
    global tts_model
    if tts_model is not None:
        return tts_model
    from omnivoice import OmniVoice
    cuda_ok = torch.cuda.is_available()
    device = "cuda:0" if cuda_ok else "cpu"
    dtype = torch.float16 if cuda_ok else torch.float32
    print(f"🔊 [TTS] กำลังโหลด OmniVoice (device={device}, dtype={dtype})...")
    tts_model = OmniVoice.from_pretrained("k2-fsa/OmniVoice", device_map=device, dtype=dtype)
    print("✅ [TTS] OmniVoice โหลดสำเร็จ! 🎙️")
    return tts_model


# ============================================================
# [6] OmniVoice TTS Route
# ============================================================
@app.post("/tts")
async def tts(
    text: str = Form(...),
    mode: str = Form("auto"),
    instruct: str = Form(""),
    ref_text: str = Form(""),
    ref_audio: UploadFile = File(None),
    speed: float = Form(1.0),
    num_step: int = Form(32),
    bg: BackgroundTasks = None,
):
    try:
        clean_text = text.strip()
        if not clean_text:
            raise HTTPException(status_code=400, detail="ข้อความว่างเปล่า")
        m = load_tts_model()
        gen_kwargs = {"text": clean_text, "speed": speed, "num_step": num_step}
        ref_tmp_path = None
        if mode == "clone":
            if ref_audio is None or not ref_audio.filename:
                raise HTTPException(status_code=400, detail="โหมด Voice Cloning ต้องมีไฟล์เสียงอ้างอิง")
            suffix = os.path.splitext(ref_audio.filename)[1] or ".wav"
            tmp_ref = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
            tmp_ref.write(await ref_audio.read())
            tmp_ref.close()
            ref_tmp_path = tmp_ref.name
            gen_kwargs["ref_audio"] = ref_tmp_path
            if ref_text.strip():
                gen_kwargs["ref_text"] = ref_text.strip()
        elif mode == "design":
            if instruct.strip():
                gen_kwargs["instruct"] = instruct.strip()
        print(f"🔊 [TTS] generate mode={mode} | text_len={len(clean_text)} | speed={speed} | steps={num_step}")
        audio_list = m.generate(**gen_kwargs)
        if ref_tmp_path:
            try:
                os.remove(ref_tmp_path)
            except Exception:
                pass
        if not audio_list:
            raise HTTPException(status_code=500, detail="สร้างเสียงล้มเหลว")
        tmp_out = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
        tmp_out.close()
        sf.write(tmp_out.name, audio_list[0], 24000)
        print(f"✅ [TTS] เสร็จ! → {tmp_out.name}")
        if bg:
            bg.add_task(cleanup, [tmp_out.name])
        safe = re.sub(r'[^\w\-]', '', clean_text.replace(' ', '_'))[:30] or "tts"
        return FileResponse(tmp_out.name, filename=f"{safe}.wav", media_type="audio/wav")
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ [TTS] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# [7] Whisper STT Route (ถอดเสียงอย่างเดียว ไม่แปล + คืน JSON)
# ============================================================
@app.post("/asr")
async def asr(
    file: UploadFile = File(None),
    url: str = Form(""),
    language: str = Form("auto"),
    bg: BackgroundTasks = None,
):
    """
    Speech-to-Text (ถอดเสียงเป็นข้อความอย่างเดียว ไม่แปล)
    ใช้ Whisper ตัวเดียวกับ Translator → ไม่ต้องลงอะไรเพิ่ม
    คืน JSON: {text, language, timestamps: [{text, start, end}]}
    """
    try:
        m = load_model()

        tmp_audio = None
        temp_dir = None
        if file is not None and file.filename:
            suffix = os.path.splitext(file.filename)[1]
            tmp_audio = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
            tmp_audio.write(await file.read())
            tmp_audio.close()
            audio_input = tmp_audio.name
        elif url.strip():
            temp_dir = tempfile.mkdtemp()
            print(f"📥 [ASR] ดาวน์โหลดจาก: {url}")
            audio_input = download_audio_from_url(url.strip(), temp_dir)
        else:
            raise HTTPException(status_code=400, detail="ต้องส่ง file หรือ url")

        whisper_lang = None if language == "auto" else language
        print(f"🎙️ [ASR] transcribe | lang={whisper_lang}")
        segments, info = m.transcribe(
            audio_input,
            language=whisper_lang,
            task="transcribe",
            beam_size=5,
            vad_filter=True,
        )
        seg_list = list(segments)

        if not seg_list:
            raise HTTPException(status_code=400, detail="ไม่พบข้อความในไฟล์")

        full_text = " ".join(seg.text.strip() for seg in seg_list if seg.text.strip())
        timestamps = [
            {"text": seg.text.strip(), "start": float(seg.start), "end": float(seg.end)}
            for seg in seg_list if seg.text.strip()
        ]

        if tmp_audio:
            try:
                os.remove(tmp_audio.name)
            except Exception:
                pass
        if temp_dir:
            try:
                for f in os.listdir(temp_dir):
                    os.remove(os.path.join(temp_dir, f))
                os.rmdir(temp_dir)
            except Exception:
                pass

        print(f"✅ [ASR] เสร็จ! lang={info.language} | chars={len(full_text)} | segments={len(timestamps)}")
        return JSONResponse({
            "text": full_text,
            "language": info.language,
            "timestamps": timestamps,
        })
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ [ASR] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# [8] UVR5 Music Separator Engine (audio-separator)  ← ✅ ใหม่!
# ============================================================
def load_separator():
    """โหลด audio-separator แบบ lazy (model จะ download อัตโนมัติครั้งแรก)"""
    global separator_instance
    if separator_instance is not None:
        return separator_instance
    import logging
    from audio_separator.separator import Separator
    print("🎵 [Separator] กำลังเตรียม audio-separator...")
    separator_instance = Separator(
        log_level=logging.WARNING,
        model_file_dir=os.path.join(os.getcwd(), "models", "audio-separator"),
        output_format="WAV",
    )
    print("✅ [Separator] พร้อม! (model จะ download อัตโนมัติตอนใช้ครั้งแรก)")
    return separator_instance


# ============================================================
# [9] UVR5 Music Separator Route 
# ============================================================

@app.post("/separate")
async def separate(
    file: UploadFile = File(None),
    url: str = Form(""),
    model_filename: str = Form("model_bs_roformer_ep_317_sdr_12.9755.ckpt"),
    output_format: str = Form("WAV"),
    single_stem: str = Form(""),   # "" = ทุก stem | "Vocals" | "Instrumental"
    bg: BackgroundTasks = None,
):
    """
    Music Source Separation (แยกเสียงร้อง/ดนตรี)
    ใช้ audio-separator (UVR5) → BS-Roformer / Demucs
    คืน: stem เดียว = ไฟล์ตรง | ทุก stem = ZIP
    """
    try:
        # --- เตรียม audio input ---
        tmp_audio = None
        temp_dir = None
        if file is not None and file.filename:
            suffix = os.path.splitext(file.filename)[1]
            tmp_audio = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
            tmp_audio.write(await file.read())
            tmp_audio.close()
            audio_input = tmp_audio.name
        elif url.strip():
            temp_dir = tempfile.mkdtemp()
            print(f"📥 [Separator] ดาวน์โหลดจาก: {url}")
            audio_input = download_audio_from_url(url.strip(), temp_dir)
        else:
            raise HTTPException(status_code=400, detail="ต้องส่ง file หรือ url")

        # --- โหลด separator + model ---
        sep = load_separator()
        out_dir = tempfile.mkdtemp()
        sep.output_dir = out_dir
        sep.output_format = output_format
        sep.output_single_stem = single_stem if single_stem else None

        print(f"🎵 [Separator] แยกเสียง | model={model_filename} | stem={single_stem or 'all'} | format={output_format}")
        sep.load_model(model_filename=model_filename)
        output_files = sep.separate(audio_input)

        if not output_files:
            raise HTTPException(status_code=500, detail="แยกเสียงล้มเหลว (ไม่ได้ไฟล์ output)")

        # ✅ แก้ bug: sep.separate() คืน filename เฉยๆ → ต้องรวม full path กับ out_dir
        output_paths = [os.path.join(out_dir, os.path.basename(f)) for f in output_files]
        print(f"✅ [Separator] เสร็จ! → {output_paths}")

        # cleanup input
        if tmp_audio:
            try:
                os.remove(tmp_audio.name)
            except Exception:
                pass
        if temp_dir:
            try:
                for f in os.listdir(temp_dir):
                    os.remove(os.path.join(temp_dir, f))
                os.rmdir(temp_dir)
            except Exception:
                pass

        # --- คืนผลลัพธ์ ---
        # ถ้า stem เดียว → คืนไฟล์เดียว
        if single_stem or len(output_paths) == 1:
            out_file = output_paths[0]
            if bg:
                bg.add_task(cleanup, [out_dir])
            return FileResponse(
                out_file,
                filename=os.path.basename(out_file),
                media_type=f"audio/{output_format.lower()}",
            )

        # ถ้าหลาย stems → รวมเป็น ZIP
        base_name = os.path.splitext(os.path.basename(audio_input))[0]
        zip_path = os.path.join(out_dir, f"{base_name}_separated.zip")
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
            for f in output_paths:
                zf.write(f, os.path.basename(f))
        if bg:
            bg.add_task(cleanup, [out_dir])
        return FileResponse(
            zip_path,
            filename=f"{base_name}_separated.zip",
            media_type="application/zip",
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ [Separator] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# [10] Free GPU Memory (ปลด Whisper + OmniVoice + Separator)  ← ✅ ปรับใหม่!
# ============================================================
@app.post("/unload-others")
async def unload_others():
    """กดจากหน้า ASR/TTS/Separator เพื่อคืน VRAM ก่อนรันโมเดลหนัก"""
    global model, tts_model, separator_instance
    freed = []
    if model is not None:
        del model
        model = None
        freed.append("Whisper")
    if tts_model is not None:
        del tts_model
        tts_model = None
        freed.append("OmniVoice")
    if separator_instance is not None:
        del separator_instance
        separator_instance = None
        freed.append("UVR5 Separator")
    _free_cuda()
    msg = f"🧹 ปลด {', '.join(freed)} แล้ว" if freed else "🧹 ไม่มีโมเดลอื่นค้างอยู่"
    print(msg)
    return JSONResponse({"freed": freed, "message": msg})
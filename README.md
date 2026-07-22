# 🎬 AI Studio

> ชุดเครื่องมือ AI สำหรับงานเสียง **ครบ 4 ฟีเจอร์ในเว็บเดียว** — แปลงซับไทย • สร้างเสียงพูด • ถอดข้อความ • แยกเสียงร้อง/ดนตรี
>
> รันบน GPU ของคุณเอง • ติดตั้งง่ายด้วย double-click • สร้างด้วย ❤️ โดย **TonLikeIT**

![Python](https://img.shields.io/badge/Python-3.10--3.12-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)
![GPU](https://img.shields.io/badge/GPU-CUDA%2012.6-76B900)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ ฟีเจอร์

### 🌐 AI Translator
แปลงเสียง/วิดีโอเป็น **ซับไตเติ้ลภาษาไทย** (.srt)
- ถอดความด้วย **Whisper** (รองรับ 99 ภาษา)
- แปลเป็นไทยอัตโนมัติด้วย Google Translate
- รองรับทั้งอัปโหลดไฟล์ และวางลิงก์ YouTube / MP3

### 🔊 Text-to-Speech (OmniVoice)
แปลงข้อความเป็น **เสียงพูด** (.wav) ด้วย [OmniVoice](https://huggingface.co/k2-fsa/OmniVoice) — รองรับ 600+ ภาษา
- **Auto** — ให้โมเดลเลือกเสียงให้อัตโนมัติ
- **Voice Design** — ออกแบบเสียงเอง (เพศ/วัย/ระดับเสียง/สำเนียง)
- **Voice Cloning** — เลียนแบบเสียงจากไฟล์ตัวอย่าง (3-10 วินาที)

### 🎙️ Speech-to-Text
ถอดเสียงเป็น **ข้อความต้นฉบับ** (ไม่แปล) ด้วย **Whisper**
- รองรับ 99 ภาษา + ตรวจจับภาษาอัตโนมัติ
- พร้อม **timestamps** → export เป็น `.txt` หรือ `.srt` ได้

### 🎵 Music Separator (UVR5)
**แยกเสียงร้อง/ดนตรี** ออกจากเพลง ด้วย [audio-separator](https://github.com/nomadkaraoke/python-audio-separator) (UVR5)
- **BS-Roformer** — แยก Vocal / Instrumental (แนะนำ, คุณภาพสูงสุด)
- **Demucs v4** — แยก 4 stems (Vocal / Drums / Bass / Other)
- **Demucs 6s** — แยก 6 stems (+ Guitar / Piano)
- รองรับทั้งอัปโหลดไฟล์ และวางลิงก์ YouTube

---

## 🖼️ ภาพตัวอย่าง

> 📸

| AI Translator | Text-to-Speech |
|:---:|:---:|
| ![Translator](/docs/screenshorts/a1.png) | ![TTS](/docs/screenshorts/a2.png) |
| **Speech-to-Text** | **Music Separator** |
| ![STT](/docs/screenshorts/a4.png) | ![Separator](/docs/screenshorts/a3.png) |

---

## 🛠️ เทคโนโลยี

| ส่วน | เทคโนโลยี |
|------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | FastAPI, Python |
| AI Models | Whisper (faster-whisper), OmniVoice, audio-separator (UVR5) |
| GPU | PyTorch + CUDA 12.6, ONNX Runtime GPU |
| อื่นๆ | yt-dlp (ดาวน์โหลด YouTube), FFmpeg, Google Translate |

---

## 💻 ความต้องการระบบ

| รายการ | ขั้นต่ำ | แนะนำ |
|--------|---------|-------|
| **GPU** | NVIDIA RTX 2000 series ขึ้นไป | RTX 3060 ขึ้นไป |
| **VRAM** | 8 GB | 12 GB ขึ้นไป |
| **RAM** | 16 GB | 32 GB |
| **พื้นที่ดิสก์** | 15 GB | 20 GB ขึ้นไป (สำหรับโมเดล AI) |
| **Python** | 3.10 - 3.12 | 3.11 |
| **Node.js** | 18.18 ขึ้นไป | 20 LTS |
| **FFmpeg** | ต้องมี | - |
| **OS** | Windows 10/11, Linux | Windows 11 |

> ⚠️ **หมายเหตุ:** GPU NVIDIA เก่ากว่า RTX 2000 จะช้ามาก / CPU-only จะช้ามากๆ — แนะนำใช้ GPU ที่รองรับ CUDA

---

## 🚀 การติดตั้ง (Windows)

### ขั้นตอนที่ 1: ติดตั้งโปรแกรมที่ต้องมีก่อน
1. **Python 3.10-3.12** → [python.org](https://www.python.org/downloads/) → ⚠️ **ติ๊ก "Add Python to PATH"** ตอนติดตั้ง!
2. **Node.js 18+** → [nodejs.org](https://nodejs.org/)
3. **FFmpeg** → [gyan.dev/ffmpeg/builds](https://www.gyan.dev/ffmpeg/builds/) (ดาวน์โหลด `ffmpeg-release-essentials.zip`)
4. **Git** → [git-scm.com](https://git-scm.com/)

### ขั้นตอนที่ 2: โคลนโปรเจค
```bash
git clone https://github.com/tontheonelove/ai-audio-studio.git
cd subtitle-ai-dashboard
```

### ขั้นตอนที่ 3: วาง FFmpeg
คัดลอก `ffmpeg.exe` ไปวางในโฟลเดอร์ `backend/`
> 💡 โปรแกรมจะเพิ่ม FFmpeg เข้า PATH ให้อัตโนมัติ (ไม่งั้นต้อง add PATH เอง)

### ขั้นตอนที่ 4: ติดตั้ง (double-click)
```
ดับเบิลคลิก  install.bat
```
โปรแกรมจะติดตั้งให้ทั้งหมดอัตโนมัติ:
- สร้าง Python virtual environment
- ติดตั้ง PyTorch (CUDA 12.6)
- ติดตั้ง Python packages + Frontend dependencies

> ⏳ ขั้นตอนนี้ใช้เวลาหลายนาที (ดาวน์โหลดไฟล์ ~3-5 GB) กรุณารอจนเสร็จ

### ขั้นตอนที่ 5: เริ่มใช้งาน (double-click)
```
ดับเบิลคลิก  start.bat
```
เบราว์เซอร์จะเปิด `http://localhost:3000` อัตโนมัติ 🎉

---

## 📖 วิธีใช้งาน

> 💡 **สำคัญ:** แต่ละฟีเจอร์ใช้ GPU ร่วมกัน → หาก VRAM ไม่พอ ให้กดปุ่ม **🧹 Free GPU Memory** ก่อนสลับฟีเจอร์

### 🌐 AI Translator
1. เลือกเมนู **AI Translator**
2. อัปโหลดไฟล์เสียง/วิดีโอ หรือวางลิงก์ YouTube
3. เลือกภาษาต้นฉบับ (หรือ "ตรวจจับอัตโนมัติ")
4. กด **แปล** → ดาวน์โหลดซับไทย `.srt`

### 🔊 Text-to-Speech
1. เลือกเมนู **Text-to-Speech**
2. พิมพ์ข้อความ → เลือกโหมด (Auto / Design / Clone)
3. (โหมด Clone) อัปโหลดไฟล์เสียงอ้างอิง 3-10 วินาที
4. กด **สร้างเสียง** → ดาวน์โหลด `.wav`

### 🎙️ Speech-to-Text
1. เลือกเมนู **Speech-to-Text**
2. อัปโหลดไฟล์ หรือวางลิงก์
3. เลือกภาษา (หรือ "ตรวจจับอัตโนมัติ")
4. กด **ถอดความ** → คัดลอกข้อความ หรือดาวน์โหลด `.txt` / `.srt`

### 🎵 Music Separator
1. เลือกเมนู **Music Separator**
2. อัปโหลดเพลง หรือวางลิงก์ YouTube
3. เลือกโมเดล (BS-Roformer แนะนำ) + stem ที่ต้องการ + รูปแบบไฟล์
4. กด **แยกเสียง** → ดาวน์โหลด (ZIP ถ้าเลือกทุก stem)

---

## 📁 โครงสร้างโปรเจค

```
subtitle-ai-dashboard/
├── backend/                  # FastAPI backend (Python)
│   ├── main.py              # API หลัก (Translator + TTS + STT + Separator)
│   ├── requirements.txt     # Python dependencies
│   ├── ffmpeg.exe           # ⚠️ ต้องวางเอง (ไม่รวมใน repo)
│   └── models/              # โมเดล AI (ดาวน์โหลดอัตโนมัติ, ไม่รวมใน repo)
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/            # หน้าเว็บ + API routes
│   │   ├── components/     # UI components
│   │   ├── hooks/          # React hooks
│   │   └── lib/            # utils + constants
│   └── package.json
├── docs/screenshots/         # ภาพหน้าจอ (สำหรับ README)
├── install.bat              # สคริปต์ติดตั้ง (Windows)
├── start.bat                # เริ่มระบบ (dev mode)
├── build.bat                # สร้าง production build
├── start-prod.bat           # เริ่มระบบ (production mode)
├── README.md
└── LICENSE
```

---

## ⚠️ การแก้ปัญหา (Troubleshooting)

### ❌ `torch` / CUDA ใช้ไม่ได้
- ตรวจสอบว่าติดตั้ง **NVIDIA Driver** ล่าสุดแล้ว
- โปรแกรมติดตั้ง PyTorch CUDA 12.6 ให้อัตโนมัติ — หากผิดพลาด ให้รันใน `backend/venv`:
  ```bash
  pip install torch==2.6.0+cu126 torchaudio==2.6.0+cu126 torchvision==0.21.0+cu126 --index-url https://download.pytorch.org/whl/cu126
  ```

### ❌ ไม่พบ FFmpeg
- ดาวน์โหลด FFmpeg แล้ววาง `ffmpeg.exe` ในโฟลเดอร์ `backend/`
- หรือเพิ่ม FFmpeg ใน PATH ของระบบ

### ❌ ดาวน์โหลดโมเดลช้า / ไม่ได้
- โมเดลจะดาวน์โหลดจาก **HuggingFace mirror** อัตโนมัติ (ตั้งค่าไว้แล้วในโปรแกรม)
- ครั้งแรกที่ใช้แต่ละฟีเจอร์จะดาวน์โหลดโมเดล → ต้องเชื่อมต่ออินเทอร์เน็ต
- โมเดลจะถูกแคชไว้ที่ `C:\Users\<คุณ>\.cache\huggingface\` → ครั้งต่อไปไม่ต้องโหลดใหม่

### ❌ `CUDA out of memory`
- กดปุ่ม **🧹 Free GPU Memory** ก่อนใช้ฟีเจอร์หนัก
- ใช้ฟีเจอร์ทีละตัว (อย่าเปิดค้างหลายฟีเจอร์พร้อมกัน)
- Music Separator: ใช้ **BS-Roformer** (กิน VRAM น้อยกว่า Demucs)

### ❌ เห็นไอคอน "N" มุมล่างซ้าย / WebSocket HMR failed
- เป็นเรื่องปกติของ **dev mode** (`start.bat`) → **ไม่กระทบการใช้งาน**
- หายไปเองเมื่อรัน **production** (`build.bat` + `start-prod.bat`)

### ❌ Python เปิด Microsoft Store แทนที่จะรัน
- ถอนการติดตั้ง Python จาก Microsoft Store แล้วติดตั้งจาก [python.org](https://www.python.org/downloads/) แทน

---

## 🙏 เครดิต

โปรเจคนี้สร้างขึ้นโดยใช้เครื่องมือและโมเดล open-source ชั้นนำ:

- [faster-whisper](https://github.com/SYSTRAN/faster-whisper) — Whisper inference เร็ว
- [OmniVoice](https://huggingface.co/k2-fsa/OmniVoice) (k2-fsa) — Text-to-Speech 600+ ภาษา
- [python-audio-separator](https://github.com/nomadkaraoke/python-audio-separator) / [UVR5-UI](https://github.com/Eddycrack864/UVR5-UI) — Music Source Separation
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) — ดาวน์โหลด YouTube
- [FFmpeg](https://ffmpeg.org/) — ประมวลผลเสียง/วิดีโอ
- [Next.js](https://nextjs.org/), [FastAPI](https://fastapi.tiangolo.com/), [shadcn/ui](https://ui.shadcn.com/)

> ⚠️ **หมายเหตุเรื่อง License:** โมเดล AI แต่ละตัวมี license ของตัวเอง (เช่น OmniVoice, UVR5 models) → กรุณาตรวจสอบ license ของแต่ละโมเดลก่อนนำไปใช้เชิงพาณิชย์

---

## 📜 License

โปรเจคนี้เผยแพร่ภายใต้ [MIT License](LICENSE)

---

## 👤 ผู้พัฒนา

**TonLikeIT**
- GitHub: [@tontheonelove](https://github.com/tontheonelove)

> ⭐ ถ้าโปรเจคนี้มีประโยชน์ ฝากกด Star เป็นกำลังใจด้วยนะครับ!
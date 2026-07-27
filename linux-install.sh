#!/bin/bash
# ============================================================
#  AI Studio - Installer สำหรับ Linux (GPU ทั่วไป)
#  ใช้กับ: GTX 1060 / RTX 2060 / 3060 / 4070 / 4080 ฯลฯ
#  (ถ้าใช้ RTX 50 Series -> ใช้ linux-install-rtx50-only.sh)
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
info() { echo -e "${CYAN}[..]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

echo ""
echo "============================================================"
echo "   AI Studio  -  ติดตั้ง dependencies (Linux / GPU ทั่วไป)"
echo "============================================================"
echo ""
echo "  หมายเหตุ: ไฟล์นี้สำหรับ GPU ทั่วไป"
echo "           ถ้าคุณใช้  RTX 50 Series  ให้ใช้"
echo "           linux-install-rtx50-only.sh  แทน!"
echo ""

# ---- [1] ตรวจ Python ----
if command -v python3 >/dev/null 2>&1; then PYTHON=python3
elif command -v python >/dev/null 2>&1; then PYTHON=python
else err "ไม่พบ Python!\n        ลง: sudo apt install python3 python3-venv python3-pip   (Debian/Ubuntu)"; fi
ok "พบ Python:"; $PYTHON --version

# ---- [2] ตรวจ Node.js ----
command -v node >/dev/null 2>&1 || err "ไม่พบ Node.js!\n        ลง Node 18+ จาก https://nodejs.org/ หรือ nvm"
ok "พบ Node.js:"; node --version

# ---- [3] ตรวจ FFmpeg (เตือน ถ้าไม่มี - บน Linux ไม่ต้องวางใน backend/) ----
if command -v ffmpeg >/dev/null 2>&1; then
  ok "พบ FFmpeg ใน PATH"
else
  warn "ไม่พบ FFmpeg! โหมดลิงก์ YouTube / separator อาจใช้ไม่ได้\n        ลง: sudo apt install ffmpeg   (Debian/Ubuntu)"
fi

# ---- [4] สร้าง venv (ถ้ายังไม่มี) ----
if [ ! -d "$SCRIPT_DIR/backend/venv" ]; then
  info "กำลังสร้าง Python virtual environment ..."
  if ! $PYTHON -m venv "$SCRIPT_DIR/backend/venv"; then
    err "สร้าง venv ไม่ได้ — ส่วนใหญ่เพราะยังไม่มี python3-venv\n        แก้: sudo apt install python3-venv   (Debian/Ubuntu)\n             sudo dnf install python3        (Fedora มักมีมาพร้อม)"
  fi
  ok "สร้าง venv เสร็จ"
else
  ok "พบ venv เดิมอยู่แล้ว ข้ามการสร้าง"
fi

# ---- [5] activate venv + upgrade pip ----
# shellcheck disable=SC1091
source "$SCRIPT_DIR/backend/venv/bin/activate" || err "activate venv ล้มเหลว"
python -m pip install --upgrade pip >/dev/null 2>&1

# ---- [6] ลง PyTorch CUDA 12.6 (GPU ทั่วไป - รองรับ sm_61 ขึ้นไป) ----
echo ""
info "กำลังติดตั้ง PyTorch CUDA 12.6 ... (ขั้นนี้อาจนาน ดึง ~2.5GB)"
pip install torch==2.6.0+cu126 torchaudio==2.6.0+cu126 torchvision==0.21.0+cu126 \
  --index-url https://download.pytorch.org/whl/cu126 || err "ลง PyTorch ล้มเหลว"
ok "ลง PyTorch เสร็จ"

# ---- [7] ลง requirements.txt ----
echo ""
info "กำลังติดตั้ง Python packages ..."
pip install -r "$SCRIPT_DIR/backend/requirements.txt" || err "pip install requirements ล้มเหลว"
ok "ลง Python packages เสร็จ"

# ---- [8] ตรวจ GPU จริง ----
echo ""
info "ตรวจ GPU ..."
python -c "import torch; print('[OK] CUDA:', torch.cuda.is_available(), '| GPU:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU-only (เช็ค NVIDIA driver)')"

# ---- [9] ลง Frontend ----
echo ""
info "กำลังติดตั้ง Frontend (npm install) ... (ขั้นนี้อาจนาน)"
cd "$SCRIPT_DIR/frontend" || err "ไม่พบโฟลเดอร์ frontend"
npm install || err "npm install ล้มเหลว"
cd "$SCRIPT_DIR"
ok "ลง Frontend เสร็จ"

echo ""
echo "============================================================"
echo "   ติดตั้งเสร็จสมบูรณ์!"
echo "   ขั้นตอนต่อไป: รัน  bash linux-start.sh  เพื่อเริ่มใช้งาน"
echo "============================================================"
echo ""
#!/bin/bash
# ============================================================
#  AI Studio - Installer สำหรับ Linux (RTX 50 Series เท่านั้น)
#  ใช้กับ: RTX 5050 / 5060 / 5070 / 5080 / 5090 (Blackwell)
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
echo "   AI Studio  -  ติดตั้งสำหรับ RTX 50 Series (Linux)"
echo "============================================================"
echo ""
echo "  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
echo "  !  ไฟล์นี้สำหรับ  \"RTX 50 Series\"  เท่านั้น!           !"
echo "  !  ถ้าคุณใช้ GPU อื่น ให้ใช้  linux-install.sh  แทน!    !"
echo "  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
echo ""
read -p "  กด [Enter] ยืนยันว่าใช้ RTX 50 Series (Ctrl+C ยกเลิก) " _

# ---- [1] ตรวจ Python ----
if command -v python3 >/dev/null 2>&1; then PYTHON=python3
elif command -v python >/dev/null 2>&1; then PYTHON=python
else err "ไม่พบ Python!\n        ลง: sudo apt install python3 python3-venv python3-pip   (Debian/Ubuntu)"; fi
ok "พบ Python:"; $PYTHON --version

# ---- [2] ตรวจ Node.js ----
command -v node >/dev/null 2>&1 || err "ไม่พบ Node.js!\n        ลง Node 18+ จาก https://nodejs.org/ หรือ nvm"
ok "พบ Node.js:"; node --version

# ---- [3] ตรวจ FFmpeg ----
if command -v ffmpeg >/dev/null 2>&1; then
  ok "พบ FFmpeg ใน PATH"
else
  warn "ไม่พบ FFmpeg! ลง: sudo apt install ffmpeg   (Debian/Ubuntu)"
fi

# ---- [4] สร้าง venv (ถ้ายังไม่มี) ----
if [ ! -d "$SCRIPT_DIR/backend/venv" ]; then
  info "กำลังสร้าง Python virtual environment ..."
  if ! $PYTHON -m venv "$SCRIPT_DIR/backend/venv"; then
    err "สร้าง venv ไม่ได้ — ลง python3-venv ก่อน:\n        sudo apt install python3-venv   (Debian/Ubuntu)"
  fi
  ok "สร้าง venv เสร็จ"
else
  ok "พบ venv เดิมอยู่แล้ว ข้ามการสร้าง"
fi

# ---- [5] activate venv + upgrade pip ----
# shellcheck disable=SC1091
source "$SCRIPT_DIR/backend/venv/bin/activate" || err "activate venv ล้มเหลว"
python -m pip install --upgrade pip >/dev/null 2>&1

# ---- [6] ลง PyTorch CUDA 12.8 (RTX 50 / Blackwell - รองรับ sm_120) ----
echo ""
info "ใช้ PyTorch CUDA 12.8 สำหรับ RTX 50 Series (Blackwell sm_120)"
info "กำลังติดตั้ง PyTorch ... (ขั้นนี้อาจนาน ดึง ~2.5GB)"
pip install torch torchvision torchaudio \
  --index-url https://download.pytorch.org/whl/cu128 || err "ลง PyTorch ล้มเหลว"
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
echo "   ติดตั้งเสร็จสมบูรณ์! (RTX 50 Series)"
echo "   ขั้นตอนต่อไป: รัน  bash linux-start.sh  เพื่อเริ่มใช้งาน"
echo "============================================================"
echo ""
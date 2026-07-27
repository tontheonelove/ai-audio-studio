#!/bin/bash
# ============================================================
#  AI Studio - Launcher สำหรับ Linux (Backend + Frontend)
#  - Backend  รันข้างหลัง (background) -> log ที่ backend.log
#  - Frontend รันข้างหน้า -> กด Ctrl+C เพื่อปิดทั้งระบบ
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; NC='\033[0m'
ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
info() { echo -e "${CYAN}[..]${NC} $1"; }
err()  { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

echo ""
echo "============================================================"
echo "   AI Studio  -  กำลังเริ่มระบบ (Backend + Frontend)"
echo "============================================================"
echo ""

[ -d "$SCRIPT_DIR/backend/venv" ]      || err "ยังไม่ได้ติดตั้ง! รัน linux-install.sh ก่อน"
[ -d "$SCRIPT_DIR/frontend/node_modules" ] || err "ยังไม่ได้ติดตั้ง frontend! รัน linux-install.sh ก่อน"

BACKEND_PID=""
cleanup() {
  echo ""
  info "กำลังปิด Backend ..."
  [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null
  wait "$BACKEND_PID" 2>/dev/null
  ok "ปิดระบบเรียบร้อย"
}
trap cleanup EXIT INT TERM

# ---- เปิด Backend ข้างหลัง (เรียก uvicorn ผ่าน path ของ venv โดยตรง) ----
info "เปิด Backend (port 8000) ..."
"$SCRIPT_DIR/backend/venv/bin/uvicorn" main:app --app-dir "$SCRIPT_DIR/backend" \
  --host 0.0.0.0 --port 8000 > "$SCRIPT_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
sleep 2
if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
  err "Backend เริ่มไม่ได้ - ดู log: $SCRIPT_DIR/backend.log"
fi
ok "Backend เริ่มแล้ว (PID $BACKEND_PID) | log: backend.log"

# ---- เปิดเบราว์เซอร์อัตโนมัติ (best-effort - ข้ามได้ถ้าไม่มี GUI) ----
if command -v xdg-open >/dev/null 2>&1; then
  ( sleep 6; xdg-open http://localhost:3000 >/dev/null 2>&1 ) &
fi

echo ""
echo "============================================================"
echo "   Backend  = http://localhost:8000   (API docs)"
echo "   Frontend = http://localhost:3000   (หน้าเว็บหลัก)"
echo "   ปิดระบบ  = กด Ctrl+C ในหน้าต่างนี้"
echo "============================================================"
echo ""

# ---- เปิด Frontend ข้างหน้า (foreground) ----
info "เปิด Frontend (port 3000) ... (กด Ctrl+C เพื่อปิดทั้งระบบ)"
cd "$SCRIPT_DIR/frontend" || err "ไม่พบโฟลเดอร์ frontend"
npm run dev
# เมื่อ npm run dev จบ (Ctrl+C) -> trap cleanup จะ kill backend ให้
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title AI Studio - Installer
cd /d "%~dp0"

echo.
echo ============================================================
echo    AI Studio  -  ติดตั้ง dependencies (ทำครั้งแรกครั้งเดียว)
echo ============================================================
echo.

REM ---- [1] ตรวจ Python ----
set PYTHON=
where python >nul 2>&1 && set PYTHON=python
if not defined PYTHON where py >nul 2>&1 && set PYTHON=py
if not defined PYTHON goto :nopython
echo [OK] พบ Python:
%PYTHON% --version

REM ---- [2] ตรวจ Node.js ----
where node >nul 2>&1
if errorlevel 1 goto :nonode
echo [OK] พบ Node.js:
node --version

REM ---- [3] ตรวจ FFmpeg (เตือน ถ้าไม่มี) ----
set HAS_FFMPEG=0
where ffmpeg >nul 2>&1 && set HAS_FFMPEG=1
if exist "%~dp0backend\ffmpeg.exe" set HAS_FFMPEG=1
if "%HAS_FFMPEG%"=="0" (
    echo [WARN] ไม่พบ FFmpeg! โหมดใส่ลิงก์ YouTube และบางฟีเจอร์อาจใช้ไม่ได้
    echo        ดูวิธีลง FFmpeg ใน README.md
)

REM ---- [4] สร้าง venv (ถ้ายังไม่มี) ----
if not exist "%~dp0backend\venv\" (
    echo.
    echo [..] กำลังสร้าง Python virtual environment ...
    %PYTHON% -m venv "%~dp0backend\venv"
    if errorlevel 1 goto :error
    echo [OK] สร้าง venv เสร็จ
) else (
    echo [OK] พบ venv เดิมอยู่แล้ว ข้ามการสร้าง
)

REM ---- [5] activate venv + upgrade pip ----
call "%~dp0backend\venv\Scripts\activate.bat"
if errorlevel 1 goto :error
python -m pip install --upgrade pip >nul 2>&1

REM ---- [6] ตรวจ GPU แล้วเลือก PyTorch build ที่ถูกต้อง (สำคัญมาก!) ----
echo.
set CC_MAJOR=0
for /f "tokens=1 delims=." %%c in ('nvidia-smi --query-gpu=compute_cap --format=csv,noheader 2^>nul') do set CC_MAJOR=%%c
if "!CC_MAJOR!"=="" set CC_MAJOR=0

set TORCH_INDEX=cu126
set TORCH_SPEC=torch==2.6.0+cu126 torchaudio==2.6.0+cu126 torchvision==0.21.0+cu126

if !CC_MAJOR! GEQ 10 (
    echo [INFO] ตรวจพบ GPU สถาปัตยกรรมใหม่ ^(compute capability !CC_MAJOR!.x = Blackwell / RTX 50 Series^)
    echo        -^> ใช้ PyTorch CUDA 12.8 ^(รองรับ sm_120^)
    set TORCH_INDEX=cu128
    set TORCH_SPEC=torch torchvision torchaudio
) else (
    echo [INFO] GPU compute capability = !CC_MAJOR!.x ^(Pascal/Turing/Ampere/Ada/Hopper^)
    echo        -^> ใช้ PyTorch CUDA 12.6 ^(รองรับ sm_61 ขึ้นไป^)
)

echo.
echo [..] กำลังติดตั้ง PyTorch ^(!TORCH_INDEX!^) ... (ขั้นนี้อาจนาน ดึงไฟล์ ~2.5GB)
pip install !TORCH_SPEC! --index-url https://download.pytorch.org/whl/!TORCH_INDEX!
if errorlevel 1 goto :error
echo [OK] ลง PyTorch เสร็จ

REM ---- [7] ลง requirements.txt ----
echo.
echo [..] กำลังติดตั้ง Python packages ...
pip install -r "%~dp0backend\requirements.txt"
if errorlevel 1 goto :error
echo [OK] ลง Python packages เสร็จ

REM ---- [8] ตรวจ GPU จริง ----
echo.
echo [..] ตรวจ GPU ...
python -c "import torch; print('[OK] CUDA:', torch.cuda.is_available(), '| GPU:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU-only (เช็คไดรเวอร์ NVIDIA)')"

REM ---- [9] ลง Frontend ----
echo.
echo [..] กำลังติดตั้ง Frontend (npm install) ... (ขั้นนี้อาจนาน)
cd /d "%~dp0frontend"
call npm install
if errorlevel 1 goto :error
echo [OK] ลง Frontend เสร็จ

cd /d "%~dp0"
echo.
echo ============================================================
echo    ติดตั้งเสร็จสมบูรณ์!
echo    ขั้นตอนต่อไป: ดับเบิลคลิก  windows-start.bat  เพื่อเริ่มใช้งาน
echo ============================================================
echo.
pause
exit /b 0

:nopython
echo.
echo [ERROR] ไม่พบ Python!
echo         กรุณาติดตั้ง Python 3.10 - 3.12 จาก https://www.python.org/downloads/
echo         และ "ติ๊ก Add Python to PATH" ตอนติดตั้ง (สำคัญมาก)
goto :end

:nonode
echo.
echo [ERROR] ไม่พบ Node.js!
echo         กรุณาติดตั้ง Node.js 18 ขึ้นไป จาก https://nodejs.org/
goto :end

:error
echo.
echo [ERROR] เกิดข้อผิดพลาดระหว่างติดตั้ง - ดูข้อความสีแดงด้านบน
echo         ถ้าติดเรื่อง torch/CUDA หรือเน็ต ดู README.md ส่วน Troubleshooting
goto :end

:end
echo.
pause

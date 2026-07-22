@echo off
chcp 65001 >nul
setlocal
title AI Studio - Launcher
cd /d "%~dp0"

echo.
echo ============================================================
echo    AI Studio  -  กำลังเริ่มระบบ (Backend + Frontend)
echo ============================================================
echo.

REM ตรวจว่า install แล้วหรือยัง
if not exist "%~dp0backend\venv\" goto :notinstalled
if not exist "%~dp0frontend\node_modules\" goto :notinstalled

echo [..] เปิด Backend  (port 8000) ...
start "AI Studio - Backend [8000]" /D "%~dp0backend" cmd /k "title AI Studio - Backend [8000] && call venv\Scripts\activate.bat && echo Backend กำลังเริ่ม... (ครั้งแรกจะโหลดโมเดลจากเน็ต นานหน่อย) && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo [..] เปิด Frontend (port 3000) ...
start "AI Studio - Frontend [3000]" /D "%~dp0frontend" cmd /k "title AI Studio - Frontend [3000] && echo Frontend กำลังเริ่ม... && npm run dev"

echo.
echo [..] รอ Frontend พร้อม แล้วจะเปิดเบราว์เซอร์อัตโนมัติ ...
timeout /t 12 /nobreak >nul
start "" "http://localhost:3000"

echo.
echo ============================================================
echo    เปิดเบราว์เซอร์แล้ว! (ถ้าหน้าเว็บยังโหลดไม่เสร็จ ให้รอ/กด Refresh)
echo    Backend  = http://localhost:8000   (ดู API docs ได้)
echo    Frontend = http://localhost:3000   (หน้าเว็บหลัก)
echo    ปิดระบบ  = ปิดหน้าต่าง Backend และ Frontend ทั้ง 2 ใบ
echo ============================================================
echo.
pause
exit /b 0

:notinstalled
echo [ERROR] ยังไม่ได้ติดตั้ง dependencies!
echo         กรุณาดับเบิลคลิก  install.bat  ก่อนครั้งหนึ่ง
echo.
pause
exit /b 1
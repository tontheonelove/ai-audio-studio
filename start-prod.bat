@echo off
chcp 65001 >nul
setlocal
title AI Studio - Production
cd /d "%~dp0"

if not exist "%~dp0frontend\.next\" goto :nobuild

echo [..] เปิด Backend  (port 8000) ...
start "AI Studio - Backend [8000]" /D "%~dp0backend" cmd /k "title AI Studio - Backend [8000] && call venv\Scripts\activate.bat && uvicorn main:app --host 0.0.0.0 --port 8000"

echo [..] เปิด Frontend (port 3000, Production) ...
start "AI Studio - Frontend [3000]" /D "%~dp0frontend" cmd /k "title AI Studio - Frontend [3000] && npm run start"

echo.
echo [..] รอ Frontend พร้อม แล้วจะเปิดเบราว์เซอร์อัตโนมัติ ...
timeout /t 8 /nobreak >nul
start "" "http://localhost:3000"

echo.
echo ============================================================
echo    Production mode เริ่มแล้ว! (ไม่มีไอคอน N)
echo    ปิดระบบ = ปิดหน้าต่าง Backend และ Frontend ทั้ง 2 ใบ
echo ============================================================
echo.
pause
exit /b 0

:nobuild
echo [ERROR] ยังไม่ได้ build Frontend!
echo         กรุณาดับเบิลคลิก  build.bat  ก่อนครั้งหนึ่ง
echo.
pause
exit /b 1
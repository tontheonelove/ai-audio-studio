@echo off
chcp 65001 >nul
setlocal
title AI Studio - Production Build
cd /d "%~dp0frontend"

echo.
echo [..] กำลัง build Frontend แบบ Production (ใช้เวลา 1-3 นาที) ...
call npm run build
if errorlevel 1 (
    echo.
    echo [ERROR] build ล้มเหลว - ดูข้อความด้านบน
    pause
    exit /b 1
)
echo.
echo [OK] build เสร็จ! ต่อไปดับเบิลคลิก  start-prod.bat  เพื่อรันแบบ Production
echo     (Production จะเร็วขึ้น และไม่มีไอคอน N ของ Next.js โดยธรรมชาติ)
echo.
pause
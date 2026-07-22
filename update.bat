@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title AI Studio - Updater
cd /d "%~dp0"

echo.
echo ============================================================
echo    AI Studio  -  อัพเดทเป็นเวอร์ชันล่าสุดจาก GitHub
echo ============================================================
echo.

REM ---- [1] ตรวจว่าเป็น git repo ----
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 goto :notgit

REM ---- [2] อ่าน branch ปัจจุบัน (ไม่ hardcode main/master) ----
set BRANCH=
for /f %%b in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set BRANCH=%%b
if not defined BRANCH set BRANCH=main
echo [OK] branch ปัจจุบัน: %BRANCH%

REM ---- [3] เตือนให้ปิด Backend/Frontend ก่อน (กันไฟล์ถูก lock) ----
echo.
echo  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
echo  !  คำเตือน: กรุณา "ปิด" หน้าต่าง Backend และ Frontend  !
echo  !  (ที่เปิดจาก windows-start.bat) ให้หมดก่อน            !
echo  !  ไม่งั้นการอัพเดทอาจล้มเหลวเพราะไฟล์ถูกใช้งานอยู่    !
echo  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
echo.
echo  กด [Enter] เมื่อปิดหมดแล้ว  (หรือ Ctrl+C เพื่อยกเลิก)
pause

REM ---- [4] เก็บการแก้ไข local ชั่วคราว (git stash) กันหาย ----
set STASHED=0
set CHANGES=0
for /f %%i in ('git status --porcelain 2^>nul ^| find /c /v ""') do set CHANGES=%%i
if !CHANGES! GTR 0 (
    echo [..] พบการแก้ไข local - เก็บชั่วคราวด้วย git stash ...
    git stash push -u -m "auto-stash-before-update" >nul 2>&1
    if not errorlevel 1 (
        set STASHED=1
        echo [OK] เก็บการแก้ไข local ไว้แล้ว
    )
) else (
    echo [OK] ไม่มีการแก้ไข local - ข้าม stash
)

REM ---- [5] ดึงโค้ดล่าสุด (fast-forward อย่างเดียว = ปลอดภัย) ----
echo.
echo [..] กำลังดึงโค้ดล่าสุดจาก GitHub (git pull) ...
git pull --ff-only origin %BRANCH%
if errorlevel 1 goto :pullfail
echo [OK] ดึงโค้ดล่าสุดเรียบร้อย

REM ---- [6] คืนการแก้ไข local (ถ้าเคย stash) ----
if "!STASHED!"=="1" (
    echo [..] คืนการแก้ไข local (git stash pop) ...
    git stash pop >nul 2>&1
    if errorlevel 1 goto :conflict
    echo [OK] คืนการแก้ไข local เรียบร้อย
)

REM ---- [7] อัพเดท Python packages (ลงเฉพาะตัวที่ขาด/เปลี่ยน) ----
echo.
if not exist "%~dp0backend\venv\Scripts\activate.bat" goto :novenv
call "%~dp0backend\venv\Scripts\activate.bat"
python -m pip install --upgrade pip >nul 2>&1
echo [..] ตรวจ/ติดตั้ง Python packages ใหม่ (ถ้ามี) ...
pip install -r "%~dp0backend\requirements.txt"
if errorlevel 1 goto :error
echo [OK] Python packages พร้อม

REM ---- [8] อัพเดท Frontend packages (ลงเฉพาะตัวที่ขาด/เปลี่ยน) ----
echo.
echo [..] ตรวจ/ติดตั้ง Frontend packages ใหม่ (ถ้ามี) ...
cd /d "%~dp0frontend"
call npm install
if errorlevel 1 goto :error
cd /d "%~dp0"
echo [OK] Frontend packages พร้อม

echo.
echo ============================================================
echo    อัพเดทเสร็จสมบูรณ์!
echo    - ดับเบิลคลิก  windows-start.bat  เพื่อเริ่มใช้งาน
echo    - ถ้าเคยใช้ Production: รัน  build.bat  ก่อน 1 ครั้ง
echo ============================================================
echo.
pause
exit /b 0

:notgit
echo [ERROR] โฟลเดอร์นี้ไม่ใช่ git repository
echo         (อาจเป็นเครื่องที่ copy มาแทน git clone - ให้ clone ใหม่)
goto :end

:novenv
echo [ERROR] ไม่พบ venv - กรุณารัน  windows-install.bat  ก่อน
goto :end

:pullfail
echo.
echo [ERROR] git pull ล้มเหลว - สาเหตุที่เป็นไปได้:
echo         1) ไม่มีอินเทอร์เน็ต / เข้า GitHub ไม่ได้
echo         2) คุณมีการแก้ไข local ที่ "commit" ไว้แล้ว (diverge)
echo            - ทางแก้: backup โค้ดที่แก้ไว้ แล้วลอง  git pull  ธรรมดา
echo            - หรือถ้าไม่ต้องการเก็บ local:  git reset --hard  (คำเตือน: ลบ local ทั้งหมด)
goto :end

:conflict
echo.
echo [WARN] ดึงโค้ดใหม่สำเร็จ แต่ "คืนการแก้ไข local" เกิด conflict
echo        (คุณแก้โค้ดไฟล์เดียวกับที่เวอร์ชันใหม่เปลี่ยน)
echo        - เปิดไฟล์ที่มีเครื่องหมาย  ^<^<^<^<^<^<^  แล้วแก้ด้วยมือ
echo        - หรือดูสถานะด้วย  git status
echo        - โค้ดใหม่ "ถูกดึงมาแล้ว" แค่การแก้ไข local ของคุณต้องmerge เอง
goto :end

:error
echo.
echo [ERROR] เกิดข้อผิดพลาดระหว่างอัพเดท - ดูข้อความสีแดงด้านบน
goto :end

:end
echo.
pause
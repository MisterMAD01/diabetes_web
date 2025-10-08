@echo off

REM --- ไปที่โฟลเดอร์หลักของโปรเจกต์ (ที่ไฟล์นี้อยู่) ---
cd /d "%~dp0"

REM --- รัน Backend: install packages, แล้วรัน nodemon ในหน้าต่างใหม่ ---
start "Backend Service: Install & Run" cmd /k "cd backend && npm install && npx nodemon server.js"

REM --- รัน Frontend: install packages, แล้วรัน npm start ในหน้าต่างใหม่ ---
start "Frontend Service: Install & Run" cmd /k "cd frontend && npm install && npm start"

REM --- สคริปต์หลักจบการทำงานทันที (หน้าต่าง CMD นี้จะไม่ค้าง) ---
EXIT /B
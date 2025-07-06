@echo off
REM --- ไปที่โฟลเดรีโปรเจกต์หลัก (ที่ไฟล์นี้อยู่) ---
cd /d %~dp0

REM --- สั่งรัน Backend ด้วย nodemon ในหน้าต่างใหม่ ---
start "Backend" cmd /k "cd backend && nodemon server.js"

REM --- สั่งรัน Frontend ด้วย npm start ในหน้าต่างใหม่ ---
start "Frontend" cmd /k "cd frontend && npm start"

REM --- จบสคริปต์ ไม่ต้องรออะไรเพิ่ม ---
exit
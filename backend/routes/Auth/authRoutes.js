const express = require('express');
const router = express.Router();
const authController = require('../../controllers/Auth/authController');

// ลงทะเบียนผู้ใช้ (แบบปกติ)
router.post('/register', authController.registerUser);

// ลงทะเบียนผู้ใช้ด้วย Google
router.post('/google/register', authController.registerGoogleUser);

// ล็อกอินผู้ใช้ (แบบปกติ)
router.post('/login', authController.loginUser);

// ล็อกอินผู้ใช้ด้วย Google
router.post('/google/login', authController.loginGoogleUser);

// 🔁 ขอ Access Token ใหม่จาก Refresh Token
router.post('/refresh-token', authController.refreshToken);

// 🚪 ออกจากระบบ
router.post('/logout', authController.logout);

module.exports = router;

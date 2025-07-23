const express = require("express");
const router = express.Router();
const authController = require("../../controllers/Auth/authController");

// ลงทะเบียนผู้ใช้ (แบบปกติ)
router.post("/register", authController.registerUser);

// ล็อกอินผู้ใช้ (แบบปกติ)
router.post("/login", authController.loginUser);

// 🔁 ขอ Access Token ใหม่จาก Refresh Token
router.post("/refresh-token", authController.refreshToken);

// 🚪 ออกจากระบบ
router.post("/logout", authController.logout);
// 🔄 รวม Google login + register
router.post("/google", authController.authGoogleUser);

module.exports = router;

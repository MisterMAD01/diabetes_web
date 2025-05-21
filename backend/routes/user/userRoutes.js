const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user/userController');
const { verifyToken } = require('../../middleware/authMiddleware');

// ดึงข้อมูลโปรไฟล์ของผู้ใช้งานปัจจุบัน
router.get('/me', verifyToken, userController.getMe);

// อัปเดตโปรไฟล์พร้อมอัปโหลดรูป (avatar)
router.patch(
  '/me',
  verifyToken,
  userController.uploadAvatar,
  userController.updateMe
);

// เปลี่ยนรหัสผ่าน
router.post(
  '/change-password',
  verifyToken,
  userController.changePassword
);
module.exports = router;

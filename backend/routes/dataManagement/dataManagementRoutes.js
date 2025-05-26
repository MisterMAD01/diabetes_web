const express = require('express');
const router = express.Router();
const datamanagementController = require('../../controllers/datamanagement/datamanagementController');

// สำหรับส่งออกข้อมูล CSV ตามประเภท (patient, appointments, etc.)
router.get('/export/:type', datamanagementController.exportData);

// สำหรับนำเข้าข้อมูล CSV ตามประเภท พร้อมรับไฟล์ (ใช้ multer middleware)
router.post('/import/:type', datamanagementController.upload.single('file'), datamanagementController.importData);

module.exports = router;

console.log('✅ doctorRoutes.js loaded');
const express = require('express');
const router = express.Router();

const doctorController = require('../../controllers/doctorController/doctorController');

// ตัวอย่าง endpoint
router.get('/', doctorController.getAllDoctors);
router.post('/', doctorController.createDoctor);

module.exports = router;

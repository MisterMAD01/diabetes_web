const express = require('express');
const router = express.Router();
const EditpatientController = require('../../controllers/EditpatientController/EditpatientController');

// PUT: อัปเดตข้อมูลผู้ป่วยตาม ID
router.get('/:id', EditpatientController.getPatientById); // สำหรับโหลดข้อมูลผู้ป่วย
router.put('/:id', EditpatientController.updatePatient); // สำหรับอัปเดต
router.delete('/:id', EditpatientController.deletePatient);
router.get('/health/:id', EditpatientController.getHealthByPatientId);
router.put('/health/:id', EditpatientController.updateHealthRecord);
router.delete('/health/:id', EditpatientController.deleteHealthRecord);


module.exports = router;

const express = require('express');
const router = express.Router();
const EditpatientController = require('../../controllers/EditpatientController/EditpatientController');

// PUT: อัปเดตข้อมูลผู้ป่วยตาม ID
// แก้ลำดับใน EditpatientRoutes.js
router.get('/health/:id', EditpatientController.getHealthByPatientId);
router.put('/health/:id', EditpatientController.updateHealthRecord);
router.delete('/health/:id', EditpatientController.deleteHealthRecord);

router.get('/:id', EditpatientController.getPatientById);
router.put('/:id', EditpatientController.updatePatient);
router.delete('/:id', EditpatientController.deletePatient);



module.exports = router;

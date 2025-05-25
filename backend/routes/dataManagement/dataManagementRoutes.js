// routes/dataManagement/dataManagementRoutes.js
const express = require('express');
const router = express.Router();
const { exportData } = require('../../controllers/datamanagement/datamanagementController');

router.get('/export/:type', exportData);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getRiskCounts,
  getPatientsByColor
} = require('../../controllers/getRriskColorController/getRiskColorController');

router.get('/counts', getRiskCounts);
router.get('/list/:color', getPatientsByColor);

module.exports = router;

const express = require("express");
const router = express.Router();

const doctorController = require("../../controllers/doctorController/doctorController");

// ตัวอย่าง endpoint
router.get("/", doctorController.getAllDoctors);
router.post("/", doctorController.createDoctor);
router.put("/:id", doctorController.UpdateDoctor);
router.delete("/:id", doctorController.deleteDoctor);

module.exports = router;

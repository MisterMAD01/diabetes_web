const express = require("express");
const router = express.Router();
const history = require("../../controllers/datamanagement/historydownloadController"); // ชื่อไฟล์ให้ตรง

router.post("/download", history.saveDownloadLog);
router.get("/download", history.getDownloadLogs);
router.delete("/download", history.deleteAllDownloadLogs);

module.exports = router;

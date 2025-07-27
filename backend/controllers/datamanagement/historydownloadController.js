const db = require("../../config/db");

// POST: บันทึกประวัติการดาวน์โหลด
exports.saveDownloadLog = async (req, res) => {
  const { user_id, table_name, filename } = req.body;

  const tableNameMap = {
    patient: "ผู้ป่วย",
    appointments: "นัดหมาย",
    health_data: "สุขภาพ",
    users: "ผู้ใช้",
  };

  if (!table_name || !filename) {
    return res
      .status(400)
      .json({ error: "table_name และ filename จำเป็นต้องมี" });
  }

  if (!tableNameMap.hasOwnProperty(table_name)) {
    return res.status(400).json({
      error: `table_name ต้องเป็นหนึ่งใน: ${Object.keys(tableNameMap).join(
        ", "
      )}`,
    });
  }

  try {
    await db.execute(
      `INSERT INTO download_logs (user_id, table_name, filename) VALUES (?, ?, ?)`,
      [user_id || null, tableNameMap[table_name], filename]
    );
    res.status(201).json({ message: "บันทึกประวัติเรียบร้อยแล้ว" });
  } catch (err) {
    console.error("Error saving log:", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการบันทึกประวัติ" });
  }
};

// GET: ดึงประวัติการดาวน์โหลดล่าสุด
exports.getDownloadLogs = async (req, res) => {
  try {
    const [logs] = await db.execute(`
      SELECT dl.id, dl.table_name, dl.filename, dl.download_date,
             u.username, u.name
      FROM download_logs dl
      LEFT JOIN users u ON dl.user_id = u.id
      ORDER BY dl.download_date DESC
      LIMIT 50
    `);
    res.json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ error: "ไม่สามารถดึงประวัติการดาวน์โหลดได้" });
  }
};
// DELETE: ลบประวัติการดาวน์โหลดทั้งหมด
exports.deleteAllDownloadLogs = async (req, res) => {
  try {
    const [result] = await db.execute(`DELETE FROM download_logs`);

    res.json({
      message: `ลบประวัติทั้งหมดเรียบร้อยแล้ว (${result.affectedRows} รายการ)`,
    });
  } catch (err) {
    console.error("Error deleting all logs:", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบประวัติทั้งหมด" });
  }
};

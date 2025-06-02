const db = require('../../config/db');

// POST: บันทึกประวัติการดาวน์โหลด
exports.saveDownloadLog = async (req, res) => {
  const { user_id, table_name, filename } = req.body;

  if (!table_name || !filename) {
    return res.status(400).json({ error: 'table_name และ filename จำเป็นต้องมี' });
  }

  try {
    await db.execute(
      `INSERT INTO download_logs (user_id, table_name, filename) VALUES (?, ?, ?)`,
      [user_id || null, table_name, filename]
    );
    res.status(201).json({ message: 'บันทึกประวัติเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Error saving log:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกประวัติ' });
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
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'ไม่สามารถดึงประวัติการดาวน์โหลดได้' });
  }
};

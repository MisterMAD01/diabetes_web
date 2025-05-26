const pool = require('../../config/db');

// ดึงจำนวนผู้ป่วยแต่ละกลุ่มสี
exports.getRiskCounts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT Color AS color, COUNT(*) AS count
      FROM patient
      GROUP BY Color
    `);
    res.json(rows);
  } catch (error) {
    console.error('❌ Error in getRiskCounts:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดใน getRiskCounts' });
  }
};

// ดึงรายชื่อผู้ป่วยตามสี
exports.getPatientsByColor = async (req, res) => {
  const color = req.params.color;
  try {
    const [rows] = await pool.query(`
      SELECT Patient_ID AS id, P_Name AS fullname, Phone_Number AS phone, Age AS age
      FROM patient
      WHERE Color = ?
    `, [color]);
    res.json(rows);
  } catch (error) {
    console.error('❌ Error in getPatientsByColor:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดใน getPatientsByColor' });
  }
};

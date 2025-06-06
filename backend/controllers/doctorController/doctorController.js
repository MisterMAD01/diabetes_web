const db = require('../../config/db');

const getAllDoctors = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM doctors');
    res.json(rows);
  } catch (err) {
    console.error('โหลดข้อมูลหมอล้มเหลว:', err);
    res.status(500).json({ error: 'โหลดข้อมูลหมอไม่สำเร็จ' });
  }
};

//  เพิ่มแพทย์
console.log('✅ createDoctor handler is live');
const createDoctor = async (req, res) => {
  const { name, specialty, phone, email } = req.body;

  try {
    const [result] = await db.query(
      'INSERT INTO doctors (D_Name, specialty, phone, email) VALUES (?, ?, ?, ?)',
      [name, specialty, phone, email]
    );
    res.status(201).json({ message: 'เพิ่มแพทย์สำเร็จ', id: result.insertId });
  } catch (err) {
    console.error('เพิ่มแพทย์ล้มเหลว:', err);
    res.status(500).json({ error: 'ไม่สามารถเพิ่มแพทย์ได้' });
  }
};

module.exports = {
  getAllDoctors,
  createDoctor, // ✅ export ให้ route ใช้ได้
};

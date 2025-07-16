const db = require("../../config/db");

const getAllDoctors = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM doctors");
    res.json(rows);
  } catch (err) {
    console.error("โหลดข้อมูลหมอล้มเหลว:", err);
    res.status(500).json({ error: "โหลดข้อมูลหมอไม่สำเร็จ" });
  }
};

//  เพิ่มแพทย์
const createDoctor = async (req, res) => {
  const { name, specialty, phone, email } = req.body;

  try {
    const [result] = await db.query(
      "INSERT INTO doctors (D_Name, specialty, phone, email) VALUES (?, ?, ?, ?)",
      [name, specialty, phone, email]
    );
    res.status(201).json({ message: "เพิ่มแพทย์สำเร็จ", id: result.insertId });
  } catch (err) {
    console.error("เพิ่มแพทย์ล้มเหลว:", err);
    res.status(500).json({ error: "ไม่สามารถเพิ่มแพทย์ได้" });
  }
};

const UpdateDoctor = async (req, res) => {
  const doctorId = req.params.id; // รับไอดีแพทย์จากพารามิเตอร์ URL
  const { name, specialty, phone, email } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE doctors SET D_Name = ?, specialty = ?, phone = ?, email = ? WHERE Doctor_ID = ?`,
      [name, specialty, phone, email, doctorId]
    );

    if (result.affectedRows === 0) {
      // กรณีไม่พบแพทย์ที่จะแก้ไข
      return res.status(404).json({ error: "ไม่พบข้อมูลแพทย์ที่ต้องการแก้ไข" });
    }

    res.json({ message: "อัปเดตข้อมูลแพทย์เรียบร้อยแล้ว" });
  } catch (err) {
    console.error("อัปเดตข้อมูลแพทย์ล้มเหลว:", err);
    res.status(500).json({ error: "ไม่สามารถอัปเดตข้อมูลแพทย์ได้" });
  }
};
const deleteDoctor = async (req, res) => {
  const doctorId = req.params.id;

  try {
    const [result] = await db.query("DELETE FROM doctors WHERE Doctor_ID = ?", [
      doctorId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "ไม่พบแพทย์ที่ต้องการลบ" });
    }

    res.json({ message: "ลบแพทย์เรียบร้อยแล้ว" });
  } catch (err) {
    console.error("ลบแพทย์ล้มเหลว:", err);
    res.status(500).json({ error: "ไม่สามารถลบแพทย์ได้" });
  }
};

module.exports = {
  getAllDoctors,
  createDoctor,
  UpdateDoctor,
  deleteDoctor,
};

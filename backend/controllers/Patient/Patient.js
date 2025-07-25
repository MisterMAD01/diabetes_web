const db = require("../../config/db");

// ✅ เพิ่มข้อมูลผู้ป่วย
exports.addPatient = async (req, res) => {
  const {
    P_Name,
    Address,
    Phone_Number,
    Age,
    Gender,
    Birthdate,
    Underlying_Disease,
  } = req.body;

  // ตรวจสอบข้อมูลที่จำเป็น
  if (!P_Name || !Address || !Phone_Number || !Age || !Gender || !Birthdate) {
    return res
      .status(400)
      .json({ message: "❌ ข้อมูลไม่ครบถ้วน โปรดกรอกข้อมูลที่จำเป็น" });
  }

  const sql = `
    INSERT INTO Patient 
    (P_Name, Address, Phone_Number, Age, Gender, Birthdate, Underlying_Disease)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    P_Name,
    Address,
    Phone_Number,
    Age,
    Gender,
    Birthdate,
    Underlying_Disease || null, // หากไม่มีข้อมูลจะใช้ null
  ];

  try {
    const [result] = await db.execute(sql, values);
    res.status(201).json({
      message: "บันทึกข้อมูลผู้ป่วยสำเร็จ",
      patientId: result.insertId,
    });
  } catch (err) {
    console.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล:", err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
  }
};

// ✅ ดึงข้อมูลผู้ป่วยทั้งหมด
// ฟังก์ชันที่ดึงข้อมูลผู้ป่วยทั้งหมด
exports.getAllPatients = async (req, res) => {
  const sql = `
    SELECT 
      p.Patient_ID AS id,
      p.P_Name AS name,
      p.Age AS age,
      p.Phone_Number AS phone,
      p.Underlying_Disease AS Underlying_Disease,
      p.Color AS color_level
    FROM patient p
    ORDER BY p.Patient_ID DESC
  `;

  try {
    const [results] = await db.execute(sql);
    if (!results || results.length === 0) {
      return res.status(404).json({ message: "ไม่พบข้อมูลผู้ป่วย" });
    }
    res.status(200).json(results);
  } catch (err) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", err);
    return res
      .status(500)
      .json({ message: "ดึงข้อมูลล้มเหลว", error: err.message });
  }
};

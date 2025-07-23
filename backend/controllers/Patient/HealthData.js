const db = require("../../config/db");
const { calculateRiskScore } = require("../utils/calculateRiskScore"); // นำเข้าฟังก์ชันคำนวณความเสี่ยง
const { assignRiskColor } = require("../utils/assignRiskColor"); // นำเข้าฟังก์ชันกำหนดสี

// ฟังก์ชันที่ใช้เพิ่มข้อมูลสุขภาพและอัปเดตความเสี่ยง
exports.addHealthData = async (req, res) => {
  const { id } = req.params; // Patient_ID
  const {
    Diabetes_Mellitus,
    Systolic_BP,
    Diastolic_BP,
    Blood_Sugar,
    Height,
    Weight,
    Waist,
    Smoke,
    Note,
    Date_Recorded, // เพิ่มรับวันที่จาก req.body
  } = req.body;

  const systolic =
    Systolic_BP && !isNaN(Systolic_BP) ? parseInt(Systolic_BP) : null;
  const diastolic =
    Diastolic_BP && !isNaN(Diastolic_BP) ? parseInt(Diastolic_BP) : null;
  const sugar =
    Blood_Sugar && !isNaN(Blood_Sugar) ? parseFloat(Blood_Sugar) : null;
  const height = Height && !isNaN(Height) ? parseFloat(Height) : null;
  const weight = Weight && !isNaN(Weight) ? parseFloat(Weight) : null;
  const waist = Waist && !isNaN(Waist) ? parseFloat(Waist) : null;

  if (systolic === null || diastolic === null) {
    return res
      .status(400)
      .json({ message: "❌ ต้องระบุค่าความดันโลหิตที่ถูกต้อง" });
  }

  const Blood_Pressure = systolic + "/" + diastolic;

  // ตรวจสอบ Date_Recorded ถ้าไม่มีให้ใช้เวลาปัจจุบัน
  const recordedDate =
    Date_Recorded || new Date().toISOString().slice(0, 19).replace("T", " ");

  const sql = `
    INSERT INTO health_data 
    (Patient_ID, Diabetes_Mellitus, Blood_Pressure, Systolic_BP, Diastolic_BP,
     Blood_Sugar, Height, Weight, Waist, Smoke, Note, Date_Recorded)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    parseInt(id),
    Diabetes_Mellitus || null,
    Blood_Pressure,
    systolic,
    diastolic,
    sugar,
    height,
    weight,
    waist,
    Smoke || null,
    Note || null,
    recordedDate,
  ];

  try {
    // บันทึกข้อมูลสุขภาพ
    await db.query(sql, values);

    // คำนวณค่าความเสี่ยงใหม่หลังจากการบันทึกข้อมูลสุขภาพ
    const risk = await calculateRiskScore(id);

    // กำหนดสี (Risk Level) ตามค่าความเสี่ยง
    const color = await assignRiskColor(id);

    // อัปเดตคอลัมน์ Risk และ Color ในตาราง patient
    const updateRiskSql = `UPDATE patient SET Risk = ?, Color = ? WHERE Patient_ID = ?`;
    await db.query(updateRiskSql, [risk, color, id]);

    res
      .status(201)
      .json({ message: "✅ บันทึกข้อมูลสุขภาพและกลุ่มสีสำเร็จ", risk, color });
  } catch (err) {
    console.error("❌ บันทึกข้อมูลสุขภาพล้มเหลว:", err.sqlMessage || err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการบันทึกข้อมูลสุขภาพ" });
  }
};

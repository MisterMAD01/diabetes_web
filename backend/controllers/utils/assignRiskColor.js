const db = require("../../config/db");

// ฟังก์ชันให้คะแนนความดันโลหิต
function getBPScore(systolic, diastolic) {
  if (systolic <= 120 && diastolic <= 80) return 0;
  if (systolic <= 139 && diastolic <= 89) return 1;
  if (systolic <= 155 && diastolic <= 99) return 2;
  if (systolic <= 179 && diastolic <= 109) return 3;
  if (systolic <= 199 && diastolic <= 119) return 4;
  return 5;
}

function getSugarScore(blood_sugar) {
  if (blood_sugar <= 100) return 0;
  if (blood_sugar <= 125) return 1;
  if (blood_sugar <= 154) return 2;
  if (blood_sugar <= 182) return 3;
  if (blood_sugar <= 200) return 4;
  return 5;
}

function getColorFromAverage(score) {
  const rounded = Math.round(score);
  const colorMap = {
    0: "สีขาว",
    1: "สีเขียวอ่อน",
    2: "สีเขียวเข้ม",
    3: "สีเหลือง",
    4: "สีส้ม",
    5: "สีแดง",
  };
  return colorMap[rounded] || "สีดำ";
}

// ฟังก์ชันหลักที่ใช้ในระบบ
exports.assignRiskColor = async (patientId) => {
  try {
    const [rows] = await db.query(
      `
      SELECT 
        h.Systolic_BP AS systolic, 
        h.Diastolic_BP AS diastolic, 
        h.Blood_Sugar AS blood_sugar
      FROM health_data h
      WHERE h.Patient_ID = ?
      ORDER BY h.Date_Recorded DESC
      LIMIT 1
    `,
      [patientId]
    );

    if (!rows.length) {
      throw new Error("ไม่พบข้อมูลผู้ป่วย");
    }

    const { systolic, diastolic, blood_sugar } = rows[0];

    const bpScore = getBPScore(systolic, diastolic);
    const sugarScore = getSugarScore(blood_sugar);
    const avgScore = (bpScore + sugarScore) / 2;
    const color = getColorFromAverage(avgScore);

    // ตัวเลือก: อัปเดตข้อมูลสีในฐานข้อมูล
    // await db.execute('UPDATE patient SET Color = ? WHERE Patient_ID = ?', [color, patientId]);

    return color;
  } catch (err) {
    console.error("Error assigning risk color:", err);
    throw new Error("เกิดข้อผิดพลาดในการคำนวณสีความเสี่ยง");
  }
};

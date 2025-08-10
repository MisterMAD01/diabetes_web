const db = require("../../config/db");
const { Parser } = require("json2csv");
const multer = require("multer");
const { parse } = require("csv-parse");
const fs = require("fs");

// ตั้งค่า multer เก็บไฟล์ชั่วคราวใน tmp/
const upload = multer({ dest: "tmp/" });

// ฟังก์ชันช่วยแปลง CSV เป็น JSON
const parseCSV = (filePath) =>
  new Promise((resolve, reject) => {
    const records = [];
    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, trim: true }))
      .on("data", (row) => records.push(row))
      .on("end", () => resolve(records))
      .on("error", (err) => reject(err));
  });

// ฟังก์ชันส่งออกข้อมูล CSV พร้อมกรองช่วงวันที่ และบันทึกประวัติ
const exportData = async (req, res) => {
  const { type } = req.params;
  const { startDate, endDate, userId } = req.query;

  let query = "";
  let fields = [];
  let fileName = "";
  let where = "";
  let params = [];

  try {
    switch (type) {
      case "patient":
        query = `
    SELECT Patient_ID, Citizen_ID, P_Name, Address, Phone_Number, Age, Gender, Birthdate, Underlying_Disease, Risk, Color
    FROM patient
  `;
        fields = [
          "Patient_ID",
          "Citizen_ID",
          "P_Name",
          "Address",
          "Phone_Number",
          "Age",
          "Gender",
          "Birthdate",
          "Underlying_Disease",
          "Risk",
          "Color",
        ];

        fileName = "patient_data.csv";

        if (startDate && endDate) {
          where = " WHERE Birthdate BETWEEN ? AND ?";
          params = [startDate, endDate];
        }
        break;

      case "appointments":
        query = `
  SELECT Appointment_ID, Patient_ID, Appointment_Date, Appointment_Time, Reason, Status, Created_At, Doctor_ID
  FROM appointments
`;
        fields = [
          "Appointment_ID",
          "Patient_ID",
          "Appointment_Date",
          "Appointment_Time",
          "Reason",
          "Status",
          "Created_At",
          "Doctor_ID",
        ];

        fileName = "appointments_data.csv";

        if (startDate && endDate) {
          where = " WHERE Appointment_Date BETWEEN ? AND ?";
          params = [startDate, endDate];
        }
        break;

      case "health_data":
        query = `
          SELECT Health_Data_ID, Patient_ID, Diabetes_Mellitus, Blood_Pressure, Systolic_BP, Diastolic_BP,
                 Blood_Sugar, Height, Weight, Waist, Smoke, Note, Date_Recorded, HbA1c
          FROM health_data
        `;
        fields = [
          "Health_Data_ID",
          "Patient_ID",
          "Diabetes_Mellitus",
          "Blood_Pressure",
          "Systolic_BP",
          "Diastolic_BP",
          "Blood_Sugar",
          "Height",
          "Weight",
          "Waist",
          "Smoke",
          "Note",
          "Date_Recorded",
          "HbA1c",
        ];
        fileName = "health_data.csv";

        if (startDate && endDate) {
          where = " WHERE Date_Recorded BETWEEN ? AND ?";
          params = [startDate, endDate];
        }
        break;

      case "users":
        query = `
    SELECT id, username, name, email, approved, role, password,google_id, created_at, updated_at
    FROM users
  `;
        fields = [
          "id",
          "username",
          "name",
          "email",
          "approved",
          "role",
          "password",
          "google_id",
          "created_at",
          "updated_at",
        ];
        fileName = "users_data.csv";

        if (startDate && endDate) {
          where = " WHERE created_at BETWEEN ? AND ?";
          params = [startDate, endDate];
        }
        break;

      default:
        return res.status(400).json({ error: "ประเภทข้อมูลไม่ถูกต้อง" });
    }

    const finalQuery = query + where;
    const [rows] = await db.execute(finalQuery, params);

    const parser = new Parser({ fields });
    const csv = parser.parse(rows);

    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.setHeader("Content-Type", "text/csv");
    res.status(200).send(csv);
  } catch (error) {
    console.error("Export error:", error.stack || error);
    res.status(500).json({ error: "ไม่สามารถส่งออกข้อมูลได้" });
  }
};

// ฟังก์ชันนำเข้า CSV เข้า DB โดยไม่เพิ่มข้อมูลซ้ำ (ตรวจสอบคีย์หลักหรือ unique field)
const importData = async (req, res) => {
  const { type } = req.params;

  if (!req.file) {
    return res.status(400).json({ error: "ไม่มีไฟล์อัพโหลด" });
  }

  try {
    const records = await parseCSV(req.file.path);
    fs.unlinkSync(req.file.path); // ลบไฟล์ชั่วคราว

    if (records.length === 0) {
      return res.status(400).json({ error: "ไฟล์ CSV ว่างเปล่า" });
    }

    let insertQuery = "";
    let checkDuplicateQuery = "";
    let paramsArray = [];

    switch (type) {
      case "patient":
        insertQuery = `INSERT INTO patient (
    Patient_ID, Citizen_ID, P_Name, Address, Phone_Number, Age, Gender, Birthdate, Underlying_Disease, Risk, Color
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        checkDuplicateQuery = `SELECT Patient_ID FROM patient WHERE Patient_ID = ?`;
        paramsArray = records.map((r) => [
          r.Patient_ID,
          r.Citizen_ID,
          r.P_Name,
          r.Address || null,
          r.Phone_Number || null,
          r.Age,
          r.Gender,
          r.Birthdate ? r.Birthdate.split("T")[0] : null,
          r.Underlying_Disease || null,
          r.Risk || null,
          r.Color || null,
        ]);
        break;

      case "appointments":
        insertQuery = `INSERT INTO appointments (
  Appointment_ID, Patient_ID, Appointment_Date, Appointment_Time, Reason, Status, Created_At, Doctor_ID
) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        checkDuplicateQuery = `SELECT Appointment_ID FROM appointments WHERE Appointment_ID = ?`;

        paramsArray = records.map((r) => [
          r.Appointment_ID,
          r.Patient_ID,
          r.Appointment_Date ? r.Appointment_Date.split("T")[0] : null,
          r.Appointment_Time || null,
          r.Reason || null,
          r.Status || null,
          r.Created_At ? r.Created_At.split("T")[0] : null,
          r.Doctor_ID || null,
        ]);

        break;

      case "health_data":
        insertQuery = `INSERT INTO health_data (Health_Data_ID, Patient_ID, Diabetes_Mellitus, Blood_Pressure, Systolic_BP, Diastolic_BP, Blood_Sugar, Height, Weight, Waist, Smoke, Note, Date_Recorded, HbA1c)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        checkDuplicateQuery = `SELECT Health_Data_ID FROM health_data WHERE Health_Data_ID = ?`;
        paramsArray = records.map((r) => [
          r.Health_Data_ID,
          r.Patient_ID,
          r.Diabetes_Mellitus,
          r.Blood_Pressure,
          r.Systolic_BP,
          r.Diastolic_BP,
          r.Blood_Sugar,
          r.Height,
          r.Weight,
          r.Waist,
          r.Smoke,
          r.Note,
          r.Date_Recorded ? r.Date_Recorded.split("T")[0] : null,
          r.HbA1c,
        ]);
        break;

      case "users":
        insertQuery = `INSERT INTO users (id, username, name, email, approved, role, password, google_id, created_at, updated_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        checkDuplicateQuery = `SELECT id FROM users WHERE id = ?`;
        paramsArray = records.map((r) => [
          r.id,
          r.username,
          r.name,
          r.email,
          r.approved,
          r.role,
          r.password,
          r.google_id,
          r.created_at ? r.created_at.split("T")[0] : null, // แปลงวันที่ถ้ามี
          r.updated_at ? r.updated_at.split("T")[0] : null,
        ]);
        break;

      default:
        return res.status(400).json({ error: "ประเภทข้อมูลไม่ถูกต้อง" });
    }

    let insertedCount = 0;
    for (const params of paramsArray) {
      // ตรวจสอบว่ามีข้อมูลซ้ำไหม
      const [rows] = await db.execute(checkDuplicateQuery, [params[0]]);
      if (rows.length === 0) {
        await db.execute(insertQuery, params);
        insertedCount++;
      }
    }

    res.json({
      message: `นำเข้าข้อมูล ${type} จำนวน ${insertedCount} รายการเรียบร้อย`,
    });
  } catch (error) {
    console.error("Import error:", error.stack || error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการนำเข้าข้อมูล" });
  }
};

module.exports = {
  exportData,
  importData,
  upload,
};

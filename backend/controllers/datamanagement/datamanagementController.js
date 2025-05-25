const db = require('../../config/db');
const { Parser } = require('json2csv');

const exportData = async (req, res) => {
  const { type } = req.params;
  const { startDate, endDate } = req.query;

  let query = '';
  let fields = [];
  let fileName = '';
  let where = '';
  let params = [];

  try {
    switch (type) {
      case 'patient':
        query = `
          SELECT Patient_ID, P_Name, Gender, Birthdate, Age, Underlying_Disease, Risk, Color
          FROM patient
        `;
        fields = ['Patient_ID', 'P_Name', 'Gender', 'Birthdate', 'Age', 'Underlying_Disease', 'Risk', 'Color'];
        fileName = 'patient_data.csv';

        // ใช้ Birthdate เป็นเงื่อนไขช่วงวันที่ (ตัวอย่าง)
        if (startDate && endDate) {
          where = ' WHERE Birthdate BETWEEN ? AND ?';
          params = [startDate, endDate];
        }
        break;

      case 'appointments':
        query = `
          SELECT Appointment_ID, Patient_ID, Appointment_Date, Appointment_Time, Reason, Status, Created_At
          FROM appointments
        `;
        fields = ['Appointment_ID', 'Patient_ID', 'Appointment_Date', 'Appointment_Time', 'Reason', 'Status', 'Created_At'];
        fileName = 'appointments_data.csv';

        if (startDate && endDate) {
          where = ' WHERE Appointment_Date BETWEEN ? AND ?';
          params = [startDate, endDate];
        }
        break;

      case 'health_data':
        query = `
          SELECT Health_Data_ID, Patient_ID, Diabetes_Mellitus, Blood_Pressure, Systolic_BP, Diastolic_BP,
                 Blood_Sugar, Height, Weight, Waist, Smoke, Note, Date_Recorded, HbA1c
          FROM health_data
        `;
        fields = ['Health_Data_ID', 'Patient_ID', 'Diabetes_Mellitus', 'Blood_Pressure', 'Systolic_BP', 'Diastolic_BP',
                  'Blood_Sugar', 'Height', 'Weight', 'Waist', 'Smoke', 'Note', 'Date_Recorded', 'HbA1c'];
        fileName = 'health_data.csv';

        if (startDate && endDate) {
          where = ' WHERE Date_Recorded BETWEEN ? AND ?';
          params = [startDate, endDate];
        }
        break;

      case 'users':
        query = `
          SELECT id, username, name, email, approved, role, created_at, updated_at
          FROM users
        `;
        fields = ['id', 'username', 'name', 'email', 'approved', 'role', 'created_at', 'updated_at'];
        fileName = 'users_data.csv';

        if (startDate && endDate) {
          where = ' WHERE created_at BETWEEN ? AND ?';
          params = [startDate, endDate];
        }
        break;

      default:
        return res.status(400).json({ error: 'ประเภทข้อมูลไม่ถูกต้อง' });
    }

    const finalQuery = query + where;
    const [rows] = await db.execute(finalQuery, params);

    const parser = new Parser({ fields });
    const csv = parser.parse(rows);

    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Type', 'text/csv');
    res.status(200).send(csv);
  } catch (error) {
    console.error('Export error:', error.message);
    res.status(500).json({ error: 'ไม่สามารถส่งออกข้อมูลได้' });
  }
};

module.exports = {
  exportData,
};

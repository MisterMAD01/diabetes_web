const db = require('../../config/db'); // หรือโมดูลเชื่อมต่อฐานข้อมูลของคุณ

exports.getPatientById = async (req, res) => {
  const { id } = req.params;
  console.log('🔍 Fetching patient ID:', id);
  try {
const [rows] = await db.query('SELECT * FROM patient WHERE Patient_ID = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลผู้ป่วย' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Error getting patient:', err);
    console.error('❌ Database error:', err); // ดูที่ terminal
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลผู้ป่วยได้' });
  }
};

exports.updatePatient = async (req, res) => {
  const { id } = req.params;
  const {
    P_Name,
    Age,
    Birthdate,
    Phone_Number,
    Underlying_Disease,
    Address,
    Gender
  } = req.body;

  try {
    const query = `
      UPDATE patient
      SET 
        P_Name = ?,
        Age = ?,
        Birthdate = ?,
        Phone_Number = ?,
        Underlying_Disease = ?,
        Address = ?,
        Gender = ?
      WHERE Patient_ID = ?
    `;

    const values = [P_Name, Age, Birthdate, Phone_Number, Underlying_Disease, Address, Gender, id];

    await db.query(query, values);

    res.status(200).json({ message: 'อัปเดตผู้ป่วยเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('❌ Error updating patient:', err);
    res.status(500).json({ error: 'ไม่สามารถอัปเดตข้อมูลได้' });
  }
};


exports.deletePatient = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM patient WHERE Patient_ID = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบผู้ป่วยที่จะลบ' });
    }

    res.status(200).json({ message: 'ลบผู้ป่วยและข้อมูลที่เกี่ยวข้องเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('❌ Error deleting patient:', err);
    res.status(500).json({ error: 'ไม่สามารถลบข้อมูลได้' });
  }
};

exports.getHealthByPatientId = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT Health_Data_ID, Date_Recorded, Diabetes_Mellitus, Systolic_BP, Diastolic_BP,
              Blood_Sugar, Height, Weight, Waist, Smoke, Note
       FROM health_data
       WHERE Patient_ID = ?
       ORDER BY Date_Recorded DESC`,
      [id]
    );

    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching health data:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลสุขภาพได้' });
  }
};

exports.updateHealthRecord = async (req, res) => {
  const { id } = req.params;
  const {
    Date_Recorded, Diabetes_Mellitus, Systolic_BP, Diastolic_BP,
    Blood_Sugar, Height, Weight, Waist, Smoke, Note
  } = req.body;

  try {
    const query = `
      UPDATE health_data
      SET
        Date_Recorded = ?,
        Diabetes_Mellitus = ?,
        Systolic_BP = ?,
        Diastolic_BP = ?,
        Blood_Sugar = ?,
        Height = ?,
        Weight = ?,
        Waist = ?,
        Smoke = ?,
        Note = ?
      WHERE Health_Data_ID = ?
    `;
    const values = [
      Date_Recorded, Diabetes_Mellitus, Systolic_BP, Diastolic_BP,
      Blood_Sugar, Height, Weight, Waist, Smoke, Note, id
    ];

    const [result] = await db.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลสุขภาพที่ต้องการอัปเดต' });
    }

    res.status(200).json({ message: 'อัปเดตข้อมูลสุขภาพเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('❌ Error updating health record:', err);
    res.status(500).json({ error: 'ไม่สามารถอัปเดตข้อมูลสุขภาพได้' });
  }
};

exports.deleteHealthRecord = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM health_data WHERE Health_Data_ID = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลสุขภาพที่จะลบ' });
    }

    res.status(200).json({ message: 'ลบข้อมูลสุขภาพเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('❌ Error deleting health record:', err);
    res.status(500).json({ error: 'ไม่สามารถลบข้อมูลสุขภาพได้' });
  }
};

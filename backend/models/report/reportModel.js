// models/report/reportModel.js
const db = require('../../config/db');

exports.getPatients = async () => {
  const [rows] = await db.query(`
    SELECT Patient_ID, P_Name
    FROM patient
  `);
  return rows;
};

exports.getReportByPatientId = async (id) => {
  const [rows] = await db.query(`
    SELECT 
      p.Patient_ID,
      p.P_Name,
      p.Address,
      p.Phone_Number AS Phone,
      p.Age AS Age,
      p.Gender,
      p.Birthdate AS Birthday,
      p.Risk AS Risk_Percentage,
      p.Color
    FROM patient p
    WHERE p.Patient_ID = ?
  `, [id]);
  return rows[0];
};


exports.getHealthTrendsByPatientId = async (id) => {
  const [rows] = await db.query(`
    SELECT 
      Date_Recorded AS date,
      Blood_Sugar AS sugar,
      Systolic_BP AS systolic,
      Diastolic_BP AS diastolic,
      Weight AS weight,
      Waist AS waist
    FROM health_data
    WHERE Patient_ID = ?
    ORDER BY Date_Recorded ASC
  `, [id]);
  return rows;
};
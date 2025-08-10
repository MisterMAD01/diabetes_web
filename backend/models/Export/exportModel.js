const pool = require("../../config/db");

exports.getLatestPatientData = async (ids) => {
  const [rows] = await pool.query(
    `
    SELECT p.Patient_ID, p.P_Name, p.Age,p.Citizen_ID,
           p.Color AS Risk_Level, p.Risk AS Risk_Percentage,
           h.Blood_Sugar, h.Systolic_BP, h.Diastolic_BP, h.Date_Recorded
    FROM patient p
    LEFT JOIN health_data h ON p.Patient_ID = h.Patient_ID
    WHERE p.Patient_ID IN (${ids.map(() => "?").join(",")})
    ORDER BY h.Date_Recorded DESC
  `,
    ids
  );

  return rows;
};

exports.getLatestForExcel = async (ids) => {
  const [rows] = await pool.query(
    `
    SELECT p.Patient_ID AS Patient_ID, 
           p.Citizen_ID AS Citizen_ID,
           p.P_Name AS P_Name, 
           p.Age,
           p.Color AS Risk_Level, 
           p.Risk AS Risk_Percentage,
           h.Blood_Sugar AS Blood_Sugar,
           CONCAT(h.Systolic_BP, '/', h.Diastolic_BP) AS Blood_Pressure,
           MAX(h.Date_Recorded) AS Date_Recorded,
           h.Weight AS Weight,
           h.Waist AS Waist
    FROM patient p
    LEFT JOIN health_data h ON p.Patient_ID = h.Patient_ID
    WHERE p.Patient_ID IN (${ids.map(() => "?").join(",")})
    GROUP BY p.Patient_ID, p.Citizen_ID, p.P_Name, p.Age, p.Color, p.Risk, h.Weight, h.Waist
    ORDER BY Date_Recorded DESC;
  `,
    ids
  );

  return rows;
};

exports.getHealthTrends = async (patientId) => {
  const [rows] = await pool.query(
    `
    SELECT h.Date_Recorded, h.Blood_Sugar, h.Weight, h.Systolic_BP, h.Diastolic_BP, h.Waist
    FROM health_data h
    WHERE h.Patient_ID = ?
    ORDER BY h.Date_Recorded ASC
  `,
    [patientId]
  );

  return rows;
};

exports.getPatientNames = async (ids) => {
  if (!ids || ids.length === 0) {
    return [];
  }

  const [rows] = await pool.query(
    `
    SELECT p.Patient_ID AS ID, p.P_Name AS Name, p.Citizen_ID
    FROM patient p
    WHERE p.Patient_ID IN (${ids.map(() => "?").join(",")})
  `,
    ids
  );

  return rows;
};

exports.getAllPatientNames = async () => {
  const [rows] = await pool.query(`
    SELECT Patient_ID AS ID, P_Name AS Name, Citizen_ID
    FROM patient
    ORDER BY P_Name
  `);
  return rows;
};

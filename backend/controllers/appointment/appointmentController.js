const pool = require("../../config/db");

// เพิ่มการนัดหมายใหม่
exports.createAppointment = async (req, res) => {
  const {
    Patient_ID,
    Appointment_Date,
    Appointment_Time,
    Reason,
    Doctor_ID,
    Status,
  } = req.body;

  try {
    await pool.execute(
      "INSERT INTO appointments (Patient_ID, Appointment_Date, Appointment_Time, Reason, Doctor_ID, Status) VALUES (?, ?, ?, ?, ?, ?)",
      [
        Patient_ID,
        Appointment_Date,
        Appointment_Time,
        Reason,
        Doctor_ID ?? null,
        Status || "Scheduled",
      ]
    );
    res.status(201).json({ message: "Appointment created successfully" }); // ส่งสถานะ 201
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ message: "Failed to create appointment" }); // ส่งสถานะ 500 เมื่อเกิดข้อผิดพลาด
  }
};

// ดึงรายการนัดหมายทั้งหมด พร้อมชื่อผู้ป่วย
exports.getAppointments = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
         a.Appointment_ID,
         a.Patient_ID,
         a.Doctor_ID, 
         p.P_Name AS Patient_Name,
         p.Citizen_ID, 
         a.Appointment_Date,
         a.Appointment_Time,
         a.Reason,
         a.Status,
         d.D_Name AS Doctor_Name
       FROM appointments a
       LEFT JOIN patient p ON a.Patient_ID = p.Patient_ID
       LEFT JOIN doctors d ON a.Doctor_ID = d.Doctor_ID`
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
};

// อัปเดตสถานะการนัดหมาย
exports.updateAppointmentStatus = async (req, res) => {
  const { Appointment_ID, Status } = req.body;

  try {
    await pool.execute(
      "UPDATE appointments SET Status = ? WHERE Appointment_ID = ?",
      [Status, Appointment_ID]
    );
    res
      .status(200)
      .json({ message: "Appointment status updated successfully" });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ message: "Failed to update appointment status" });
  }
};

// ลบการนัดหมาย
exports.deleteAppointment = async (req, res) => {
  const { Appointment_ID } = req.params;

  try {
    await pool.execute("DELETE FROM appointments WHERE Appointment_ID = ?", [
      Appointment_ID,
    ]);
    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ message: "Failed to delete appointment" });
  }
};

// อัปเดตการนัดหมาย
exports.updateAppointment = async (req, res) => {
  const {
    Appointment_ID,
    Appointment_Date,
    Appointment_Time,
    Reason,
    Status,
    Doctor_ID,
  } = req.body;

  try {
    await pool.execute(
      "UPDATE appointments SET Appointment_Date = ?, Appointment_Time = ?, Reason = ?, Status = ?, Doctor_ID = ? WHERE Appointment_ID = ?",
      [
        Appointment_Date,
        Appointment_Time,
        Reason,
        Status,
        Doctor_ID,
        Appointment_ID,
      ]
    );
    res.status(200).json({ message: "Appointment updated successfully" });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ message: "Failed to update appointment" });
  }
};

exports.getPatients = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT Patient_ID, P_Name, Citizen_ID FROM patient"
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ message: "Failed to fetch patients" });
  }
};

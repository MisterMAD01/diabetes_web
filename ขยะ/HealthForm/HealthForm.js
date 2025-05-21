import React, { useState, useEffect } from "react";
import axios from "axios";
import "./HealthForm.css";

const HealthForm = () => {
  const [patients, setPatients] = useState([]);
  const [healthData, setHealthData] = useState({
    patientId: "",
    date: "",
    bloodSugar: "",
    systolicBP: "",
    diastolicBP: "",
    weight: "",
    height: "",
    waist: "",
    bmi: "",
    bloodPressure: "",
    smoke: "ไม่สูบ",
    note: "",
  });

  // ดึงรายชื่อผู้ป่วยจาก API
  useEffect(() => {
    axios.get("http://localhost:5000/api/appointments/patients")
      .then(response => setPatients(response.data))
      .catch(error => console.error("Error fetching patients", error));
  }, []);

  // คำนวณ BMI เมื่อมีการเปลี่ยนน้ำหนักหรือส่วนสูง
  useEffect(() => {
    if (healthData.weight && healthData.height) {
      const bmi = (healthData.weight / ((healthData.height / 100) ** 2)).toFixed(2);
      setHealthData(prev => ({ ...prev, bmi }));
    }
  }, [healthData.weight, healthData.height]);

  // คำนวณค่าความดันโลหิต
  useEffect(() => {
    if (healthData.systolicBP && healthData.diastolicBP) {
      const bp = `${healthData.systolicBP}/${healthData.diastolicBP}`;
      setHealthData(prev => ({ ...prev, bloodPressure: bp }));
    }
  }, [healthData.systolicBP, healthData.diastolicBP]);

  // อัพเดตค่าจากการกรอกข้อมูล
  const handleChange = (e) => {
    setHealthData({ ...healthData, [e.target.name]: e.target.value });
  };

  // ส่งข้อมูลไปยัง API
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/healthRecordRoutes/add", healthData);
      alert("บันทึกข้อมูลสุขภาพสำเร็จ!");
    } catch (error) {
      console.error("Error saving health record", error);
    }
  };

  return (
    <div className="container">
      <h2>บันทึกข้อมูลสุขภาพ</h2>
      <form onSubmit={handleSubmit}>
        <label>เลือกผู้ป่วย:
          <select name="patientId" onChange={handleChange} required>
            <option value="">เลือกผู้ป่วย</option>
            {patients.map(patient => (
              <option key={patient.Patient_ID} value={patient.Patient_ID}>
                {patient.P_Name}
              </option>
            ))}
          </select>
        </label>

        <label>วันที่: <input type="date" name="date" onChange={handleChange} required /></label>
        <label>น้ำตาลในเลือด: <input type="number" name="bloodSugar" onChange={handleChange} /></label>
        <label>ความดันโลหิตสูงสุด: <input type="number" name="systolicBP" onChange={handleChange} /></label>
        <label>ความดันโลหิตต่ำสุด: <input type="number" name="diastolicBP" onChange={handleChange} /></label>
        <label>น้ำหนัก (kg): <input type="number" name="weight" onChange={handleChange} /></label>
        <label>ส่วนสูง (cm): <input type="number" name="height" onChange={handleChange} /></label>
        <label>รอบเอว (cm): <input type="number" name="waist" onChange={handleChange} /></label>
        <label>BMI: <input type="text" name="bmi" value={healthData.bmi} readOnly /></label>
        <label>ความดันโลหิต: <input type="text" name="bloodPressure" value={healthData.bloodPressure} readOnly /></label>

        <label>สูบบุหรี่:
          <select name="smoke" onChange={handleChange}>
            <option value="ไม่สูบ">ไม่สูบ</option>
            <option value="สูบ">สูบ</option>
          </select>
        </label>

        <label>หมายเหตุ: <textarea name="note" onChange={handleChange}></textarea></label>
        <button type="submit">บันทึกข้อมูล</button>
      </form>
    </div>
  );
};

export default HealthForm;

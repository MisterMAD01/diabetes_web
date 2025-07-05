import React, { useState } from 'react';
import './AddPatient.css'; // ใช้ร่วมกับ AddPatientForm

const API_URL = process.env.REACT_APP_API;

const AddHealthData = ({ patientId, onSuccess, closePopup }) => {
  const [formData, setFormData] = useState({
    Systolic_BP: '', Diastolic_BP: '', Blood_Sugar: '',
    Height: '', Weight: '', Waist: '',
    Note: '', Diabetes_Mellitus: 'ไม่ป่วยเป็นเบาหวาน', Smoke: 'ไม่สูบ',
  });

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;

    if (type === 'checkbox') {
      if (name === "Diabetes_Mellitus") {
        setFormData(prev => ({
          ...prev,
          [name]: checked ? "ป่วยเป็นเบาหวาน" : "ไม่ป่วยเป็นเบาหวาน"
        }));
      } else if (name === "Smoke") {
        setFormData(prev => ({
          ...prev,
          [name]: checked ? "สูบ" : "ไม่สูบ"
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const systolic = parseInt(formData.Systolic_BP, 10);
    const diastolic = parseInt(formData.Diastolic_BP, 10);
    if (isNaN(systolic) || isNaN(diastolic)) {
      alert('❌ กรุณาระบุค่าความดันโลหิตให้ถูกต้อง');
      return;
    }

    const payload = {
      Systolic_BP: systolic,
      Diastolic_BP: diastolic,
      Blood_Sugar: parseFloat(formData.Blood_Sugar) || 0,
      Height: parseFloat(formData.Height) || 0,
      Weight: parseFloat(formData.Weight) || 0,
      Waist: parseFloat(formData.Waist) || 0,
      Note: formData.Note,
      Diabetes_Mellitus: formData.Diabetes_Mellitus,
      Smoke: formData.Smoke,
      Blood_Pressure: `${systolic}/${diastolic}`,
    };

    try {
      await fetch(`${API_URL}/api/patient/${patientId}/health`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      await fetch(`${API_URL}/api/patient/${patientId}/update-color`, {
        method: 'POST'
      });

      alert('✅ บันทึกข้อมูลสุขภาพและอัปเดตกลุ่มสีสำเร็จ');
      onSuccess?.();
      closePopup?.();
    } catch (err) {
      alert('❌ เกิดข้อผิดพลาด');
      console.error(err);
    }
  };

  return (
    <div className="add-patient-popup-overlay">
      <div className="add-patient-popup-content">
        <button className="add-patient-close-btn" onClick={closePopup}>✖</button>
        <div className="add-patient-form-container">
          <h2>บันทึกข้อมูลสุขภาพ</h2>
          <form onSubmit={handleSubmit}>
            <div className="add-patient-form-row">
              <input type="number" name="Systolic_BP" placeholder="ค่าบน (SYS)" onChange={handleChange} required />
              <input type="number" name="Diastolic_BP" placeholder="ค่าล่าง (DIA)" onChange={handleChange} required />
              <input type="number" step="0.1" name="Blood_Sugar" placeholder="น้ำตาล (mg/dL)" onChange={handleChange} />
            </div>

            <div className="add-patient-form-row">
              <input type="number" step="0.1" name="Height" placeholder="ส่วนสูง (cm)" onChange={handleChange} />
              <input type="number" step="0.1" name="Weight" placeholder="น้ำหนัก (kg)" onChange={handleChange} />
              <input type="number" step="0.1" name="Waist" placeholder="รอบเอว (cm)" onChange={handleChange} />
            </div>

            <label className="add-patient-checkbox">
              <input
                type="checkbox"
                name="Diabetes_Mellitus"
                checked={formData.Diabetes_Mellitus === "ป่วยเป็นเบาหวาน"}
                onChange={handleChange}
              /> เป็นเบาหวาน
            </label>

            <label className="add-patient-checkbox">
              <input
                type="checkbox"
                name="Smoke"
                checked={formData.Smoke === "สูบ"}
                onChange={handleChange}
              /> สูบบุหรี่
            </label>

            <textarea name="Note" placeholder="หมายเหตุ" onChange={handleChange} className="add-patient-textarea" />
            <button className="add-patient-submit-btn" type="submit">บันทึก</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddHealthData;

import React, { useState } from 'react';
import './AddPatient.css';

const API_URL = process.env.REACT_APP_API;

const AddPatientForm = ({ onSuccess, closePopup }) => {
  const [formData, setFormData] = useState({
    name: '', lastname: '', address: '',
    village: '', subdistrict: '', district: '', province: '',
    birthdate: '', gender: '', phone: '', age: '', disease: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // คำนวณอายุเมื่อเกิดการเปลี่ยนแปลงในวันเกิด
    if (name === "birthdate") {
      const birthdate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthdate.getFullYear();
      let monthDifference = today.getMonth() - birthdate.getMonth();
      let dayDifference = today.getDate() - birthdate.getDate();

      // ถ้าหน้าเดือนเกิดยังไม่ถึงในปีนี้ ให้ลดอายุลง 1 ปี
      if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
        age--;
      }

      // คำนวณเดือนที่เหลือ
      let months = today.getMonth() - birthdate.getMonth();
      if (months < 0) months += 12;

      setFormData(prev => ({ ...prev, age: `${age} ปี ${months} เดือน` }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ตรวจสอบค่าที่ป้อนและสร้าง payload
    const payload = {
      P_Name: `${formData.name} ${formData.lastname}`,
      Address: `${formData.address} หมู่ ${formData.village} ต.${formData.subdistrict} อ.${formData.district} จ.${formData.province}`,
      Phone_Number: formData.phone,
      Age: formData.age,  // ส่งอายุที่คำนวณได้
      Gender: formData.gender,
      Birthdate: formData.birthdate,
      Underlying_Disease: formData.disease || null, // หากไม่มีข้อมูลจะใช้ null
    };

    // ตรวจสอบค่าที่สำคัญก่อนส่ง
    if (!payload.P_Name || !payload.Address || !payload.Phone_Number || !payload.Age || !payload.Gender || !payload.Birthdate) {
      alert('❌ ข้อมูลไม่ครบถ้วน');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/patient/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP Error! Status: ${res.status}`);
      alert('✅ บันทึกข้อมูลสำเร็จ');
      onSuccess?.();
      closePopup?.();
    } catch (err) {
      alert('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  return (
    <div className="add-patient-popup-overlay">
      <div className="add-patient-popup-content">
        <button className="add-patient-close-btn" onClick={closePopup}>✖</button>
        <div className="add-patient-form-container">
          <h2>เพิ่มข้อมูลผู้ป่วย</h2>
          <form onSubmit={handleSubmit}>
            <div className="add-patient-form-row">
              <input type="text" name="name" placeholder="ชื่อ" value={formData.name} onChange={handleChange} required />
              <input type="text" name="lastname" placeholder="นามสกุล" value={formData.lastname} onChange={handleChange} required />
            </div>

            <input type="text" name="address" placeholder="ที่อยู่" value={formData.address} onChange={handleChange} required />

            <div className="add-patient-form-row">
              <input type="text" name="village" placeholder="หมู่" value={formData.village} onChange={handleChange} required />
              <input type="text" name="subdistrict" placeholder="ตำบล" value={formData.subdistrict} onChange={handleChange} required />
              <input type="text" name="district" placeholder="อำเภอ" value={formData.district} onChange={handleChange} required />
              <input type="text" name="province" placeholder="จังหวัด" value={formData.province} onChange={handleChange} required />
            </div>

            <div className="add-patient-form-row">
              <input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} required />
              <select name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="">เพศ</option>
                <option value="ชาย">ชาย</option>
                <option value="หญิง">หญิง</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
              <input type="text" name="phone" placeholder="เบอร์โทรติดต่อ" value={formData.phone} onChange={handleChange} required />
            </div>

            <div className="add-patient-form-row">
              <input type="text" name="age" placeholder="อายุ" value={formData.age} onChange={handleChange} disabled />
              <input type="text" name="disease" placeholder="โรคประจำตัว" value={formData.disease} onChange={handleChange} />
            </div>

            <button className="add-patient-submit-btn" type="submit">บันทึกข้อมูล</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPatientForm;
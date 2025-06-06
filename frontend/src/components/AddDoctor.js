// components/DoctorFormModal.js
import React, { useState } from 'react';
import axios from 'axios';

const AddDoctor = ({ onClose }) => {
  const [form, setForm] = useState({
    name: '',
    specialty: '',
    phone: '',
    email: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API}/api/doctors`, form);
      alert('เพิ่มข้อมูลแพทย์สำเร็จ');
      onClose();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการเพิ่มแพทย์');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal large">
        <div className="modal-header">
          <h3>เพิ่มข้อมูลแพทย์</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-grid">
            <div>
              <label>ชื่อแพทย์</label>
              <input name="name" required onChange={handleChange} />
            </div>
            <div>
              <label>ความเชี่ยวชาญ</label>
              <input name="specialty" onChange={handleChange} />
            </div>
            <div>
              <label>โทรศัพท์</label>
              <input name="phone" onChange={handleChange} />
            </div>
            <div>
              <label>อีเมล</label>
              <input name="email" type="email" onChange={handleChange} />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">ยกเลิก</button>
            <button type="submit" className="submit-btn">บันทึก</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDoctor;

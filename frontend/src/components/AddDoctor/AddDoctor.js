import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify"; // เพิ่มการใช้งาน toast
import "./AddDoctor.css";

const AddDoctor = ({ onClose }) => {
  const [form, setForm] = useState({
    name: "",
    specialty: "",
    phone: "",
    email: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API}/api/doctors`, form);
      toast.success("เพิ่มข้อมูลแพทย์สำเร็จ");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาดในการเพิ่มแพทย์");
    }
  };

  return (
    <div className="doctor-modal-overlay">
      <div className="doctor-modal-container">
        <div className="doctor-modal-header">
          <h3>เพิ่มข้อมูลแพทย์</h3>
          <button className="doctor-modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <form className="doctor-modal-form" onSubmit={handleSubmit}>
          <div className="doctor-modal-grid">
            <div className="doctor-form-group">
              <label>ชื่อแพทย์</label>
              <input
                name="name"
                required
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div className="doctor-form-group">
              <label>ความเชี่ยวชาญ</label>
              <input
                name="specialty"
                value={form.specialty}
                onChange={handleChange}
              />
            </div>
            <div className="doctor-form-group">
              <label>โทรศัพท์</label>
              <input name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div className="doctor-form-group">
              <label>อีเมล</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="doctor-modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="doctor-btn-cancel"
            >
              ยกเลิก
            </button>
            <button type="submit" className="doctor-btn-submit">
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDoctor;

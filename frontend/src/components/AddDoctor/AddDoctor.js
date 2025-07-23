import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./AddDoctor.css";

const AddDoctor = ({ onClose }) => {
  const [form, setForm] = useState({
    name: "",
    specialty: "",
    phone: "",
    email: "",
  });

  // ตรวจสอบเบอร์โทร: ต้องเป็นเลข 10 หลัก หรือไม่กรอกก็ได้
  const validatePhone = (phone) => {
    if (!phone) return true; // ไม่กรอกผ่าน
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone.trim());
  };

  // ตรวจสอบอีเมล ฟอร์แมตถูกต้อง หรือไม่กรอกก็ได้
  const validateEmail = (email) => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      // จำกัดให้กรอกเฉพาะเลข และความยาวไม่เกิน 10 ตัว
      let numericValue = value.replace(/\D/g, "");
      if (numericValue.length > 10) {
        numericValue = numericValue.slice(0, 10);
      }
      setForm((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ตรวจสอบชื่อแพทย์ไม่ว่าง
    if (!form.name.trim()) {
      toast.error("กรุณากรอกชื่อแพทย์");
      return;
    }

    // ตรวจสอบเบอร์โทร
    if (!validatePhone(form.phone)) {
      toast.error("กรุณากรอกเบอร์โทรให้ถูกต้อง 10 หลัก");
      return;
    }

    // ตรวจสอบอีเมล
    if (!validateEmail(form.email)) {
      toast.error("กรุณากรอกอีเมลให้ถูกต้อง");
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API}/api/doctors`, {
        name: form.name.trim(),
        specialty: form.specialty.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
      });
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
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                maxLength={10}
                inputMode="numeric"
              />
            </div>
            <div className="doctor-form-group">
              <label>อีเมล</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="กรอกอีเมล หรือเว้นว่าง"
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

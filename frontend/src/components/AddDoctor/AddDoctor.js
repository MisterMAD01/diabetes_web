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

  const [errors, setErrors] = useState({}); // เก็บข้อความ error

  const validatePhone = (phone) => {
    if (!phone) return true;
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone.trim());
  };

  const validateEmail = (email) => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      let numericValue = value.replace(/\D/g, "");
      if (numericValue.length > 10) {
        numericValue = numericValue.slice(0, 10);
      }
      setForm((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    // เคลียร์ error เมื่อแก้ไขฟิลด์นั้น
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "กรุณากรอกชื่อแพทย์";

    if (!validatePhone(form.phone))
      newErrors.phone = "กรุณากรอกเบอร์โทรให้ถูกต้อง 10 หลัก";

    if (!validateEmail(form.email))
      newErrors.email = "กรุณากรอกอีเมลให้ถูกต้อง";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("กรุณาแก้ไขข้อผิดพลาดในฟอร์ม");
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
              {errors.name && <div className="input-error">{errors.name}</div>}
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
              {errors.phone && (
                <div className="input-error">{errors.phone}</div>
              )}
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
              {errors.email && (
                <div className="input-error">{errors.email}</div>
              )}
            </div>
          </div>
          <div className="doctor-modal-actions">
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

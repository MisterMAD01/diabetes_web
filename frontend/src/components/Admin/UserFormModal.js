import React, { useState } from "react";
import "./UserFormModal.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserForm = ({ handleSave, handleCancel }) => {
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    name: "", // จะถูกอัปเดตจาก firstName + lastName
    email: "",
    password: "",
    role: "user",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "username") {
      // แปลงเป็นพิมพ์เล็ก และลบตัวอักษรที่ไม่ใช่ a-z, 0-9, _
      const formatted = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: formatted,
      }));
      return;
    }
    // ถ้าเปลี่ยนชื่อหรือสกุล ให้ประกอบเป็น name ใหม่
    if (name === "firstName" || name === "lastName") {
      const newFirstName = name === "firstName" ? value : formData.firstName;
      const newLastName = name === "lastName" ? value : formData.lastName;
      const fullName = `${newFirstName} ${newLastName}`.trim();

      setFormData((prev) => ({
        ...prev,
        [name]: value,
        name: fullName,
      }));
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.username ||
      !formData.name ||
      !formData.email ||
      !formData.password
    ) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    if (handleSave) {
      handleSave(formData); // จะได้ชื่อเต็มใน formData.name
    }
  };

  return (
    <div className="user-modal-overlay">
      <div className="user-modal">
        <button className="user-modal-close-btn" onClick={handleCancel}>
          ×
        </button>
        <form className="user-modal-form" onSubmit={handleSubmit}>
          <h2 className="user-modal-title">เพิ่มผู้ใช้ใหม่</h2>

          <label>
            ชื่อ:
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            นามสกุล:
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            ชื่อผู้ใช้:
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            อีเมล:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            รหัสผ่าน:
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            สิทธิ์การใช้งาน:
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </label>

          <div className="user-modal-actions">
            <button type="submit" className="user-modal-submit-btn">
              เพิ่มผู้ใช้
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;

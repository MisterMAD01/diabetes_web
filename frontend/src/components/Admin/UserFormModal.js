import React, { useState } from "react";
import "./UserFormModal.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserForm = ({ handleSave, handleCancel }) => {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
      handleSave(formData);
    }
  };

  return (
    <div className="user-form-overlay">
      <div className="user-form-modal">
        <button className="user-form-close-btn" onClick={handleCancel}>
          ×
        </button>
        <form className="user-form" onSubmit={handleSubmit}>
          <h2>เพิ่มผู้ใช้ใหม่</h2>
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
            ชื่อจริง:
            <input
              type="text"
              name="name"
              value={formData.name}
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
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button type="submit">เพิ่มผู้ใช้</button>
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;

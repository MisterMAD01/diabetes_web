import React, { useState } from "react";
import './UserFormModal.css';

const API_URL = process.env.REACT_APP_API;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("กรุณาเข้าสู่ระบบเพื่อดำเนินการ");
        return;
      }
      // ใช้ endpoint ที่คุณใช้จริง
      const response = await fetch(`${API_URL}/api/admin/accounts/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "เกิดข้อผิดพลาด");

      alert(result.message);

      if (handleSave) handleSave();

      setFormData({
        username: "",
        name: "",
        email: "",
        password: "",
        role: "user",
      });
    } catch (error) {
      alert(error.message || "เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="modal-close-btn" onClick={handleCancel}>×</button>
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
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit">💾 เพิ่มผู้ใช้</button>
            <button type="button" className="cancel-btn" onClick={handleCancel}>ยกเลิก</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;

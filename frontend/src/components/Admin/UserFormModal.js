import React, { useState } from "react";
import "./UserFormModal.css";

function UserFormModal({ isOpen, onClose, onSubmitUser }) {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    role: "user"
  });

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitUser(formData);
    setFormData({
      username: "",
      name: "",
      email: "",
      password: "",
      role: "user"
    });
  };

  if (!isOpen) return null;

  return (
    <div className="user-form-modal__overlay">
      <div className="user-form-modal">
        <div className="user-form-modal__header">
          <h6>เพิ่มผู้ใช้ใหม่</h6>
          <button className="user-form-modal__close-btn" onClick={onClose}>×</button>
        </div>
        <form className="user-form-modal__form" onSubmit={handleSubmit}>
          <div>
            <label>ชื่อผู้ใช้</label>
            <input type="text" name="username" value={formData.username} onChange={handleInputChange} required />
          </div>
          <div>
            <label>ชื่อจริง</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
          </div>
          <div>
            <label>อีเมล</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
          </div>
          <div>
            <label>รหัสผ่าน</label>
            <input type="password" name="password" value={formData.password} onChange={handleInputChange} required />
          </div>
          <div>
            <label>สิทธิ์การใช้งาน</label>
            <select name="role" value={formData.role} onChange={handleInputChange} required>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
          <div className="user-form-modal__actions">
            <button type="button" className="user-form-modal__cancel-btn" onClick={onClose}>ยกเลิก</button>
            <button type="submit" className="user-form-modal__submit-btn">บันทึก</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserFormModal;

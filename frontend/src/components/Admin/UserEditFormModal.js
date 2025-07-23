import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import "./UserEditFormModal.css";

const UserEditForm = ({ user, handleSave, handleCancel }) => {
  const [formData, setFormData] = useState({ ...user });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSave(formData);
  };

  const isGoogleUser = !!user.google_id; // เช็คว่าผูก google หรือไม่

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="modal-close-btn" onClick={handleCancel}>
          ×
        </button>
        <form className="user-edit-form" onSubmit={handleSubmit}>
          <h2>แก้ไขข้อมูลผู้ใช้</h2>
          <label>
            ชื่อผู้ใช้:
            <input
              type="text"
              name="username"
              value={formData.username || ""}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            ชื่อจริง:
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            อีเมล:
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              required
              disabled={isGoogleUser} // ปิดช่องถ้าผูก Google
            />
            {isGoogleUser && (
              <div className="connected-google">
                <strong>เชื่อมต่อด้วย :</strong>{" "}
                <FontAwesomeIcon icon={faGoogle} className="icon-google" />{" "}
                Google
              </div>
            )}
          </label>
          <label>
            สิทธิ์การใช้งาน:
            <select
              name="role"
              value={formData.role || ""}
              onChange={handleChange}
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </label>
          <div className="modal-actions">
            <button type="submit" className="submit-btn">
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditForm;

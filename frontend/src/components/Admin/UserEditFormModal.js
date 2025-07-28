import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import "./UserEditFormModal.css";

const UserEditForm = ({ user, handleSave, handleCancel }) => {
  // แยกชื่อ-นามสกุลจาก name
  const splitName = (fullName) => {
    if (!fullName) return { firstName: "", lastName: "" };
    const parts = fullName.trim().split(" ");
    return {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
    };
  };

  const initialName = splitName(user.name);
  const [formData, setFormData] = useState({
    ...user,
    firstName: initialName.firstName,
    lastName: initialName.lastName,
  });

  const isGoogleUser = !!user.google_id;

  const handleChange = (e) => {
    const { name, value } = e.target;

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
    handleSave(formData); // ส่ง name ที่รวมแล้ว
  };

  return (
    <div className="user-edit-modal-overlay">
      <div className="user-edit-modal">
        <button
          className="user-edit-modal-close-btn"
          onClick={handleCancel}
          aria-label="ปิด"
        >
          ×
        </button>
        <form className="user-edit-modal-form" onSubmit={handleSubmit}>
          <h2 className="user-edit-modal-title">แก้ไขข้อมูลผู้ใช้</h2>
          <div style={{ display: "flex", gap: "10px" }}>
            <label style={{ flex: 1 }}>
              ชื่อ:
              <input
                type="text"
                name="firstName"
                value={formData.firstName || ""}
                onChange={handleChange}
                required
              />
            </label>
            <label style={{ flex: 1 }}>
              นามสกุล:
              <input
                type="text"
                name="lastName"
                value={formData.lastName || ""}
                onChange={handleChange}
                required
              />
            </label>
          </div>
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
            อีเมล:
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              required
              disabled={isGoogleUser}
            />
            {isGoogleUser && (
              <div className="user-edit-google-info">
                <strong>เชื่อมต่อด้วย:</strong>{" "}
                <FontAwesomeIcon
                  icon={faGoogle}
                  className="user-edit-google-icon"
                />
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

          <div className="user-edit-modal-actions">
            <button type="submit" className="user-edit-modal-submit-btn">
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditForm;

import React, { useState } from "react";
import "./UserEditForm.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

function UserEditForm({ user, onSaveUser, onCancelEdit }) {
  const [editFormData, setEditFormData] = useState({ ...user, password: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // state สำหรับ toggle ดูรหัสผ่าน
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleEditInputChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    if (e.target.name === "password") {
      setPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setPasswordError("");
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();

    if (editFormData.password && editFormData.password !== confirmPassword) {
      setPasswordError("รหัสผ่านใหม่กับยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    const dataToSend = { ...editFormData };
    if (!editFormData.password || !editFormData.password.trim()) {
      delete dataToSend.password;
    }

    onSaveUser(dataToSend);
  };

  return (
    <form className="user-edit-form" onSubmit={handleEditSubmit}>
      <div className="user-edit-form__grid">
        <div className="user-edit-form__field">
          <label>ชื่อผู้ใช้</label>
          <input
            type="text"
            name="username"
            value={editFormData.username || ""}
            onChange={handleEditInputChange}
            required
          />
        </div>
        <div className="user-edit-form__field">
          <label>ชื่อจริง</label>
          <input
            type="text"
            name="name"
            value={editFormData.name || ""}
            onChange={handleEditInputChange}
            required
          />
        </div>
        <div className="user-edit-form__field">
          <label>อีเมล</label>
          <div className="user-edit-form__input-icon-group">
            {editFormData.google_id && (
              <span
                className="user-edit-form__google-icon"
                title="ล็อกอินด้วย Google"
              >
                G
              </span>
            )}
            <input
              type="email"
              name="email"
              value={editFormData.email || ""}
              onChange={handleEditInputChange}
              required
              style={editFormData.google_id ? { paddingLeft: 32 } : {}}
              disabled={!!editFormData.google_id}
            />
          </div>
        </div>
        <div className="user-edit-form__field">
          <label>สิทธิ์การใช้งาน</label>
          <select
            name="role"
            value={editFormData.role || ""}
            onChange={handleEditInputChange}
            required
          >
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
        {/* --- ช่องรหัสผ่านใหม่ --- */}
        <div className="user-edit-form__field">
          <label>
            รหัสผ่านใหม่{" "}
            <span style={{ fontWeight: "normal", color: "#888" }}>
              (หากไม่ต้องการเปลี่ยนรหัสผ่าน ให้เว้นว่าง)
            </span>
          </label>
          <div className="user-edit-form__input-icon-group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={editFormData.password || ""}
              onChange={handleEditInputChange}
              placeholder="••••••••••"
              autoComplete="new-password"
            />
<button
  type="button"
  className="user-edit-form__password-toggle"
  tabIndex={-1}
  onClick={() => setShowPassword((prev) => !prev)}
  aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "ดูรหัสผ่าน"}
>
  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
</button>

          </div>
        </div>
        {/* --- ช่องยืนยันรหัสผ่านใหม่ --- */}
        <div className="user-edit-form__field">
          <label>ยืนยันรหัสผ่านใหม่</label>
          <div className="user-edit-form__input-icon-group">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="••••••••••"
              autoComplete="new-password"
            />
<button
  type="button"
  className="user-edit-form__password-toggle"
  tabIndex={-1}
  onClick={() => setShowConfirmPassword((prev) => !prev)}
  aria-label={showConfirmPassword ? "ซ่อนรหัสผ่าน" : "ดูรหัสผ่าน"}
>
  <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
</button>

          </div>
          {passwordError && (
            <div style={{ color: "#d7263d", marginTop: "4px", fontSize: "0.96em" }}>
              {passwordError}
            </div>
          )}
        </div>
      </div>
      <div className="user-edit-form__actions">
        <button
          type="button"
          className="user-edit-form__cancel-btn"
          onClick={onCancelEdit}
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          className="user-edit-form__submit-btn"
          disabled={
            editFormData.password &&
            confirmPassword &&
            editFormData.password !== confirmPassword
          }
        >
          บันทึก
        </button>
      </div>
    </form>
  );
}

export default UserEditForm;

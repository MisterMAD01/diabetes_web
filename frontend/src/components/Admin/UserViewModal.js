import React from "react";
import './UserViewModal.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

const API_URL = process.env.REACT_APP_API;

const formatDateThai = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('th-TH', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const UserViewModal = ({
  user,
  onClose,
  onApprove,
  onRevoke,
  onEdit,
}) => {
  if (!user) return null;

  // สร้าง url เต็มสำหรับรูปโปรไฟล์ (ถ้ามี)
  const pictureUrl = user.picture
    ? (user.picture.startsWith("http")
        ? user.picture
        : `${API_URL}/api/user/uploads/${user.picture}`)
    : null;

  return (
    <div className="modal-overlay">
      <div className="modal large">
        <div className="modal-header">
          <h3>รายละเอียดผู้ใช้</h3>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-form">
          {/* กล่องสีฟ้าอ่อน: avatar + ชื่อ + username + สถานะ */}
          <div className="user-summary-box">
            <div className="user-summary-row">
              {pictureUrl ? (
                <img src={pictureUrl} alt={user.name} className="user-avatar-img" />
              ) : (
                <div className="user-avatar-placeholder">
                  {user.name?.[0] || user.username?.[0]}
                </div>
              )}
              <div className="user-info">
                <div className="user-realname">{user.name}</div>
                <div className="user-username">ชื่อผู้ใช้: {user.username}</div>
              </div>
              <span className={`status-badge ${user.approved ? "approved" : "pending"}`}>
                {user.approved ? "อนุมัติแล้ว" : "รออนุมัติ"}
              </span>
            </div>
          </div>
          <div className="view-field"><b>อีเมล:</b> {user.email}</div>
          <div className="view-field"><b>สิทธิ์การใช้งาน:</b> {user.role}</div>
          <div className="view-field">
            <b>เชื่อมต่อด้วย:</b>{" "}
            {user.google_id ? (
              <span className="provider-badge google">
                <FontAwesomeIcon icon={faGoogle} className="google-icon" />
                {" "}Google
              </span>
            ) : (
              <span className="provider-badge local">Local</span>
            )}
          </div>
          <div className="view-field">
            <b>สร้างเมื่อ:</b> {formatDateThai(user.created_at)}
          </div>
        </div>
        <div className="modal-actions">
          {!user.approved ? (
            <button className="submit-btn" onClick={() => onApprove(user.id)}>
              อนุมัติ
            </button>
          ) : (
            <button className="revoke-btn" onClick={() => onRevoke(user.id)}>
              ยกเลิกอนุมัติ
            </button>
          )}
          <button className="edit-btn" onClick={() => onEdit(user)}>
            แก้ไข
          </button>
          <button className="cancel-btn" onClick={onClose}>
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserViewModal;

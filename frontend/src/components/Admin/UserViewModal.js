import React, { useEffect, useState } from "react";
import "./UserViewModal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

const API_URL = process.env.REACT_APP_API;

const formatDateThai = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const UserViewModal = ({ user, onClose, onApprove, onRevoke, onEdit }) => {
  const [localUser, setLocalUser] = useState(user);

  useEffect(() => {
    setLocalUser(user); // อัปเดตเมื่อเปลี่ยน user ที่ส่งเข้ามา
  }, [user]);

  if (!localUser) return null;

  const pictureUrl = localUser.picture
    ? localUser.picture.startsWith("http")
      ? localUser.picture
      : `${API_URL}/api/user/uploads/${localUser.picture}`
    : null;

  const handleApprove = async () => {
    await onApprove(localUser.id);
    setLocalUser({ ...localUser, approved: true }); // อัปเดตสถานะ
  };

  const handleRevoke = async () => {
    await onRevoke(localUser.id);
    setLocalUser({ ...localUser, approved: false }); // อัปเดตสถานะ
  };

  return (
    <div className="modal-overlay">
      <div className="modal large">
        <div className="modal-header">
          <h3>รายละเอียดผู้ใช้</h3>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-form">
          <div className="user-summary-box">
            <div className="user-summary-row">
              {pictureUrl ? (
                <img
                  src={pictureUrl}
                  alt={localUser.name}
                  className="user-avatar-img"
                />
              ) : (
                <div className="user-avatar-placeholder">
                  {localUser.name?.[0] || localUser.username?.[0]}
                </div>
              )}
              <div className="user-info">
                <div className="user-realname">{localUser.name}</div>
                <div className="user-username">
                  ชื่อผู้ใช้: {localUser.username}
                </div>
              </div>
              <span
                className={`status-badge ${
                  localUser.approved ? "approved" : "pending"
                }`}
              >
                {localUser.approved ? "อนุมัติแล้ว" : "รออนุมัติ"}
              </span>
            </div>
          </div>
          <div className="view-field">
            <b>อีเมล:</b> {localUser.email}
          </div>
          <div className="view-field">
            <b>สิทธิ์การใช้งาน:</b> {localUser.role}
          </div>
          <div className="view-field">
            <b>เชื่อมต่อด้วย:</b>{" "}
            {localUser.google_id ? (
              <span className="provider-badge google">
                <FontAwesomeIcon icon={faGoogle} className="google-icon" />{" "}
                Google
              </span>
            ) : (
              <span className="provider-badge local">Local</span>
            )}
          </div>
          <div className="view-field">
            <b>สร้างเมื่อ:</b> {formatDateThai(localUser.created_at)}
          </div>
        </div>
        <div className="modal-actions">
          {!localUser.approved ? (
            <button className="submit-btn" onClick={handleApprove}>
              อนุมัติ
            </button>
          ) : (
            <button className="revoke-btn" onClick={handleRevoke}>
              ยกเลิกอนุมัติ
            </button>
          )}
          <button className="edit-btn" onClick={() => onEdit(localUser)}>
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

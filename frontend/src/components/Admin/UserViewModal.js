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
    <div className="uvm-modal-overlay">
      <div className="uvm-modal uvm-large">
        <div className="uvm-modal-header">
          <h3>รายละเอียดผู้ใช้</h3>
          <button className="uvm-modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="uvm-modal-form">
          <div className="uvm-user-summary-box">
            <div className="uvm-user-summary-row">
              {pictureUrl ? (
                <img
                  src={pictureUrl}
                  alt={localUser.name}
                  className="uvm-user-avatar-img"
                />
              ) : (
                <div className="uvm-user-avatar-placeholder">
                  {localUser.name?.[0] || localUser.username?.[0]}
                </div>
              )}
              <div className="uvm-user-info">
                <div className="uvm-user-realname">{localUser.name}</div>
                <div className="uvm-user-username">
                  ชื่อผู้ใช้: {localUser.username}
                </div>
              </div>
              <span
                className={`uvm-status-badge ${
                  localUser.approved ? "uvm-approved" : "uvm-pending"
                }`}
              >
                {localUser.approved ? "อนุมัติแล้ว" : "รออนุมัติ"}
              </span>
            </div>
          </div>
          <div className="uvm-view-field">
            <b>อีเมล:</b> {localUser.email}
          </div>
          <div className="uvm-view-field">
            <b>สิทธิ์การใช้งาน:</b> {localUser.role}
          </div>
          <div className="uvm-view-field">
            <b>เชื่อมต่อด้วย:</b>{" "}
            {localUser.google_id ? (
              <span className="uvm-provider-badge uvm-google">
                <FontAwesomeIcon icon={faGoogle} className="uvm-google-icon" />{" "}
                Google
              </span>
            ) : (
              <span className="uvm-provider-badge uvm-local">Local</span>
            )}
          </div>
          <div className="uvm-view-field">
            <b>สร้างเมื่อ:</b> {formatDateThai(localUser.created_at)}
          </div>
        </div>
        <div className="uvm-modal-actions">
          <button className="uvm-edit-btn" onClick={() => onEdit(localUser)}>
            แก้ไข
          </button>
          {!localUser.approved ? (
            <button className="uvm-submit-btn" onClick={handleApprove}>
              อนุมัติ
            </button>
          ) : (
            <button className="uvm-revoke-btn" onClick={handleRevoke}>
              ยกเลิกอนุมัติ
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserViewModal;

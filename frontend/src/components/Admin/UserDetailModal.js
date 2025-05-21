import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faEdit } from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { formatDateShortThai } from "../utils"; // ปรับ path ให้ตรงกับโปรเจกต์ของคุณ
import "./UserDetailModal.css";

function UserDetailModal({ user, onClose, onEditUser, onChangeUserStatus }) {
  if (!user) return null;

  const avatarInitial = user.name
    ? user.name[0].toUpperCase()
    : user.username[0].toUpperCase();

  // ป้องกันปัญหาค่า approved เป็น string/"0"/"1"
  const isApproved = Boolean(Number(user.approved));

  return (
    <div className="user-detail-modal__overlay">
      <div className="user-detail-modal">
        <div className="user-detail-modal__header">
          <h3>รายละเอียดผู้ใช้</h3>
          <button className="user-form-modal__close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "1.2rem 0 2rem 0",
          }}
        >
          <div className="user-detail-modal__avatar">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.username}
                style={{ width: "100%", borderRadius: "50%" }}
              />
            ) : (
              avatarInitial
            )}
          </div>
          <div>
            <div className="user-detail-modal__fullname">
              {user.name || user.username}
            </div>
            <div className="user-detail-modal__username">
              @{user.username}
            </div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <span
              className={`user-detail-modal__status-badge user-detail-modal__status-badge--${
                isApproved ? "approved" : "pending"
              }`}
            >
              {isApproved ? "อนุมัติแล้ว" : "รออนุมัติ"}
            </span>
          </div>
        </div>
        <div>
          <div style={{ marginBottom: "1rem" }}>
            <b>อีเมล:</b> {user.email || "-"}
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <b>สิทธิ์การใช้งาน:</b> {user.role || "-"}
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <b>เชื่อมต่อกับ:</b>{" "}
            {user.google_id ? (
              <>
                <FontAwesomeIcon icon={faGoogle} /> Google
              </>
            ) : (
              "-"
            )}
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <b>อัปเดตเมื่อ:</b>{" "}
            {user.updated_at ? formatDateShortThai(user.updated_at) : "-"}
          </div>
        </div>
        <div className="user-detail-modal__actions">
          {!isApproved ? (
            <button
              className="user-detail-modal__approve-btn"
              onClick={() => onChangeUserStatus(user.id, true)}
            >
              อนุมัติ
            </button>
          ) : (
            <button
              className="user-detail-modal__revoke-btn"
              onClick={() => onChangeUserStatus(user.id, false)}
            >
              ยกเลิกอนุมัติ
            </button>
          )}
          <button
            className="user-edit-form__submit-btn"
            onClick={() => onEditUser(user)}
          >
            <FontAwesomeIcon icon={faEdit} /> แก้ไข
          </button>
          <button
            className="user-detail-modal__cancel-btn"
            onClick={onClose}
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

UserDetailModal.propTypes = {
  user: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onEditUser: PropTypes.func.isRequired,
  onChangeUserStatus: PropTypes.func.isRequired,
};

export default UserDetailModal;

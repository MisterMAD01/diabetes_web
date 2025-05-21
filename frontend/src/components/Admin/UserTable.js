import React, { useState } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrashAlt, faClock, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { formatDateShortThai } from "../utils";
import "./UserTable.css";

const getInitialLetter = (name) => (name && name.trim() ? name.trim().charAt(0).toUpperCase() : "");

function UserTable({ users, onViewUser, onEditUser, onDeleteUser }) {
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);

  const handleConfirmDelete = () => {
    onDeleteUser(confirmDeleteUser.id);
    setConfirmDeleteUser(null);
  };

  return (
    <div className="user-table-container">
      <table className="user-table">
        <thead>
          <tr className="user-table__header">
            <th>#</th>
            <th>ชื่อผู้ใช้</th>
            <th>อีเมล</th>
            <th>สิทธิ์การใช้งาน</th>
            <th>สถานะ</th>
            <th>เชื่อมต่อกับ</th>
            <th>อัปเดตเมื่อ</th>
            <th>การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="user-table__row">
              <td className="user-table__cell">
                <div className="user-table__avatar">
                  {getInitialLetter(user.username)}
                </div>
              </td>
              <td className="user-table__cell">{user.username}</td>
              <td className="user-table__cell">{user.email}</td>
              <td className="user-table__cell">{user.role}</td>
              <td className="user-table__cell">
                {user.approved ? (
                  <span className="user-table__status--approved">
                    <FontAwesomeIcon icon={faCheckCircle} /> อนุมัติแล้ว
                  </span>
                ) : (
                  <span className="user-table__status--pending">
                    <FontAwesomeIcon icon={faClock} /> รออนุมัติ
                  </span>
                )}
              </td>
              <td className="user-table__cell">
                {user.google_id ? (
                  <>
                    <FontAwesomeIcon icon={faGoogle} /> Google
                  </>
                ) : "-"}
              </td>
              <td className="user-table__cell">
                {user.updated_at ? formatDateShortThai(user.updated_at) : "-"}
              </td>
              <td className="user-table__cell">
                <button className="user-table__action-btn" onClick={() => onViewUser(user)} title="ดูรายละเอียด">
                  <FontAwesomeIcon icon={faEye} />
                </button>
                <button className="user-table__action-btn" onClick={() => onEditUser(user)} title="แก้ไข">
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button className="user-table__action-btn" onClick={() => setConfirmDeleteUser(user)} title="ลบ">
                  <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Confirm Delete Modal */}
      {confirmDeleteUser && (
        <div className="user-form-modal__overlay">
          <div className="user-form-modal">
            <div className="user-form-modal__header">
              <h3>ยืนยันการลบผู้ใช้</h3>
              <button className="user-form-modal__close-btn" onClick={() => setConfirmDeleteUser(null)}>×</button>
            </div>
            <div style={{ margin: "1rem 0" }}>
              คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้ “{confirmDeleteUser.username}”?
            </div>
            <div className="user-form-modal__actions">
              <button className="user-form-modal__cancel-btn" onClick={() => setConfirmDeleteUser(null)}>ยกเลิก</button>
              <button className="user-form-modal__submit-btn" onClick={handleConfirmDelete}>ลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

UserTable.propTypes = {
  users: PropTypes.array.isRequired,
  onViewUser: PropTypes.func.isRequired,
  onEditUser: PropTypes.func.isRequired,
  onDeleteUser: PropTypes.func.isRequired
};

export default UserTable;

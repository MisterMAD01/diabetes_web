import React, { useState } from "react";
import PropTypes from "prop-types";
import "./UserTable.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import "./ComfirmDelete.css";

// Utility: get initial from username
const getInitials = (name) => {
  if (!name || !name.trim()) return "";
  return name.trim().charAt(0).toUpperCase();
};

const UserTable = ({
  users,
  handleView,
  handleEdit,
  handleDelete,
  onDeleteSuccess,
}) => {
  const [deleteUser, setDeleteUser] = useState(null);

  const confirmDelete = async () => {
    try {
      await handleDelete(deleteUser.id);
      setDeleteUser(null);
      onDeleteSuccess?.(); // toast จาก parent component
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="user-table-wrapper">
      <table className="user-table">
        <thead>
          <tr>
            <th className="user-col-avatar">#</th>
            <th className="user-col-username">ชื่อผู้ใช้</th>
            <th className="user-col-email">อีเมล</th>
            <th className="user-col-role">สิทธิ์การใช้งาน</th>
            <th className="user-col-status">สถานะ</th>
            <th className="user-col-connection">เชื่อมต่อกับ</th>
            <th className="user-col-actions">การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td data-label="#">
                <div className="user-avatar-circle">
                  {getInitials(u.username)}
                </div>
              </td>
              <td data-label="ชื่อผู้ใช้">{u.username}</td>
              <td data-label="อีเมล">{u.email}</td>
              <td data-label="สิทธิ์การใช้งาน">{u.role}</td>
              <td data-label="สถานะ">
                <span
                  className={`user-status-badge ${
                    u.approved ? "user-approved" : "user-pending"
                  }`}
                >
                  {u.approved ? "อนุมัติแล้ว" : "รออนุมัติ"}
                </span>
              </td>
              <td data-label="เชื่อมต่อกับ">
                {u.google_id ? (
                  <>
                    <FontAwesomeIcon
                      icon={faGoogle}
                      className="user-icon-google"
                    />{" "}
                    Google
                  </>
                ) : (
                  "-"
                )}
              </td>
              <td data-label="การจัดการ" className="user-action-group">
                <button
                  onClick={() => handleView(u)}
                  title="ดูรายละเอียด"
                  className="user-action-btn user-view"
                >
                  <FontAwesomeIcon icon={faEye} />
                </button>
                <button
                  onClick={() => handleEdit(u)}
                  title="แก้ไข"
                  className="user-action-btn user-edit"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  onClick={() => setDeleteUser(u)}
                  title="ลบ"
                  className="user-action-btn user-delete"
                >
                  <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Confirmation Modal */}
      {deleteUser && (
        <div className="modal-overlay">
          <div className="modal small">
            <div className="modal-icon warning">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3>ยืนยันการลบผู้ใช้</h3>
            <p>
              คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้ "{deleteUser.username}"?
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="modal-actions">
              <button
                onClick={() => setDeleteUser(null)}
                className="cancel-btn"
              >
                ยกเลิก
              </button>
              <button onClick={confirmDelete} className="delete-btn">
                ลบผู้ใช้
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

UserTable.propTypes = {
  users: PropTypes.array.isRequired,
  handleView: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  onDeleteSuccess: PropTypes.func,
};

export default UserTable;

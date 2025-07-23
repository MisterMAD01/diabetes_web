import React, { useState } from "react";
import "./ManageDoctorModal.css";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = process.env.REACT_APP_API;

const ManageDoctorModal = ({ doctors, onClose, onRefresh }) => {
  const [editDoctor, setEditDoctor] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);

  // ตรวจสอบฟอร์แมตเบอร์โทร: 10 ตัวเลข หรือว่างเปล่า
  const validatePhone = (phone) => {
    if (!phone) return true; // ไม่กรอกก็ผ่าน
    const trimmedPhone = phone.trim();
    const phoneRegex = /^\d{10}$/; // ต้องเป็นเลข 10 หลัก
    return phoneRegex.test(trimmedPhone);
  };

  // ตรวจสอบฟอร์แมตอีเมล หรือว่างเปล่า
  const validateEmail = (email) => {
    if (!email) return true; // ไม่กรอกก็ผ่าน
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const confirmDelete = (doctor) => {
    setDoctorToDelete(doctor);
    setShowConfirmDelete(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/api/doctors/${doctorToDelete.Doctor_ID}`);
      toast.success("ลบแพทย์เรียบร้อยแล้ว");
      setShowConfirmDelete(false);
      setDoctorToDelete(null);
      onRefresh();
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการลบแพทย์");
      console.error(err);
    }
  };

  const handleUpdateDoctor = async () => {
    try {
      const { Doctor_ID, D_Name, specialty, phone, email } = editDoctor;

      if (!D_Name || D_Name.trim() === "") {
        toast.error("กรุณากรอกชื่อแพทย์");
        return;
      }

      // ตรวจสอบเบอร์โทร
      if (!validatePhone(phone)) {
        toast.error("กรุณากรอกเบอร์โทรให้ถูกต้อง 10 หลัก");
        return;
      }

      // ตรวจสอบอีเมล
      if (!validateEmail(email)) {
        toast.error("กรุณากรอกอีเมลให้ถูกต้อง หรือเว้นว่างไว้");
        return;
      }

      await axios.put(`${API_URL}/api/doctors/${Doctor_ID}`, {
        name: D_Name.trim(),
        specialty: specialty ? specialty.trim() : "",
        phone: phone ? phone.trim() : "",
        email: email ? email.trim() : "",
      });

      toast.success("อัปเดตข้อมูลแพทย์เรียบร้อยแล้ว");
      setEditDoctor(null);
      onRefresh();
    } catch (err) {
      console.error("อัปเดตล้มเหลว:", err);
      toast.error("ไม่สามารถอัปเดตข้อมูลแพทย์ได้");
    }
  };

  // ฟังก์ชันจัดการกรอกเบอร์โทร รับเฉพาะตัวเลขและไม่เกิน 10 หลัก
  const handlePhoneChange = (value) => {
    // ลบทุกอย่างที่ไม่ใช่ตัวเลข
    let numericValue = value.replace(/\D/g, "");
    if (numericValue.length > 10) {
      numericValue = numericValue.slice(0, 10);
    }
    setEditDoctor({ ...editDoctor, phone: numericValue });
  };

  return (
    <div className="mdm-modal-overlay">
      <div className="mdm-modal large">
        <h3>จัดการแพทย์</h3>

        <table className="mdm-doctor-table">
          <thead>
            <tr>
              <th>ลำดับ</th>
              <th>ชื่อแพทย์</th>
              <th>ความเชี่ยวชาญ</th>
              <th>เบอร์โทร</th>
              <th>อีเมล</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doc) => (
              <tr key={doc.Doctor_ID}>
                <td>{doc.Doctor_ID}</td>
                <td>{doc.D_Name}</td>
                <td>{doc.specialty || "-"}</td>
                <td>{doc.phone || "-"}</td>
                <td>{doc.email || "-"}</td>
                <td>
                  <button
                    onClick={() => setEditDoctor(doc)}
                    className="mdm-edit-btn"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => confirmDelete(doc)}
                    className="mdm-delete-btn"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {editDoctor && (
          <div className="mdm-edit-doctor-form">
            <h4>แก้ไขแพทย์</h4>
            <label>
              ชื่อแพทย์:
              <input
                type="text"
                value={editDoctor.D_Name}
                onChange={(e) =>
                  setEditDoctor({ ...editDoctor, D_Name: e.target.value })
                }
              />
            </label>
            <label>
              ความเชี่ยวชาญ:
              <input
                type="text"
                value={editDoctor.specialty || ""}
                onChange={(e) =>
                  setEditDoctor({ ...editDoctor, specialty: e.target.value })
                }
              />
            </label>
            <label>
              เบอร์โทร:
              <input
                type="text"
                value={editDoctor.phone || ""}
                maxLength={10}
                inputMode="numeric"
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="ตัวเลข 10 หลัก หรือเว้นว่าง"
              />
            </label>
            <label>
              อีเมล:
              <input
                type="email"
                value={editDoctor.email || ""}
                onChange={(e) =>
                  setEditDoctor({ ...editDoctor, email: e.target.value })
                }
                placeholder="กรอกอีเมล หรือเว้นว่าง"
              />
            </label>
            <div className="mdm-modal-actions">
              <button
                className="mdm-cancel-btn"
                onClick={() => setEditDoctor(null)}
              >
                ยกเลิก
              </button>
              <button className="mdm-save-btn" onClick={handleUpdateDoctor}>
                บันทึก
              </button>
            </div>
          </div>
        )}

        <div className="mdm-modal-actions">
          <button className="mdm-cancel-btn" onClick={onClose}>
            ปิด
          </button>
        </div>
      </div>

      {/* Modal ยืนยันลบ */}
      {showConfirmDelete && (
        <div className="confirm-delete-overlay">
          <div className="confirm-delete-modal small">
            <div className="confirm-delete-icon warning">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3>ยืนยันการลบแพทย์</h3>
            <p>
              คุณแน่ใจหรือไม่ว่าต้องการลบแพทย์{" "}
              <strong>{doctorToDelete?.D_Name}</strong>? การกระทำนี้ไม่สามารถ
              ย้อนกลับได้
            </p>
            <div className="confirm-delete-actions">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="confirm-delete-cancel-btn"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDelete}
                className="confirm-delete-delete-btn"
              >
                ลบแพทย์
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDoctorModal;

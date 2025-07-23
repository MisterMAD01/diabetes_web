import React from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AppointmentDetailModal.css";

const AppointmentDetailModal = ({
  appointment,
  onClose,
  onStatusChange,
  onEdit,
}) => {
  if (!appointment) return null;

  const formatDateThai = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "-";
    return `${timeStr.slice(0, 5)} น.`;
  };

  const statusTextMap = {
    รอพบแพทย์: "รอพบแพทย์",
    เสร็จสิ้น: "เสร็จสิ้น",
    ยกเลิก: "ยกเลิก",
  };

  const statusText = statusTextMap[appointment.status] || appointment.status;

  // ฟังก์ชันจัดการสถานะ พร้อมโชว์ Toast แบบ async-await
  const handleChangeStatus = async (id, newStatus) => {
    try {
      await onStatusChange(id, newStatus);
      toast.success(`สถานะนัดหมายเปลี่ยนเป็น "${newStatus}" เรียบร้อยแล้ว`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("เกิดข้อผิดพลาดในการเปลี่ยนสถานะ");
    }
  };

  // ฟังก์ชันแก้ไข
  const handleEdit = (appt) => {
    onEdit(appt);
  };

  return (
    <>
      <div className="appt-detail-overlay">
        <div className="appt-detail-container large">
          <div className="appt-detail-header">
            <h3>รายละเอียดนัดหมาย</h3>
            <button className="appt-detail-close-btn" onClick={onClose}>
              &times;
            </button>
          </div>
          <div className="appt-detail-form">
            <div className="appt-detail-info-box appt-detail-status-box">
              <div>
                <p>
                  <strong>{appointment.name}</strong>
                </p>
                <p>HN: {appointment.hn}</p>
              </div>
              <div className={`appt-detail-status-badge ${appointment.status}`}>
                {statusText}
              </div>
            </div>
            <div className="appt-detail-grid">
              <div>
                <label>แพทย์ผู้ดูแล</label>
                <p>{appointment.doctor || "-"}</p>
              </div>
              <div>
                <label>วันที่</label>
                <p>{formatDateThai(appointment.date)}</p>
              </div>
              <div>
                <label>เวลา</label>
                <p>{formatTime(appointment.time)}</p>
              </div>
            </div>
            <div>
              <label>หมายเหตุ</label>
              <p>{appointment.note || "-"}</p>
            </div>
            <div className="appt-detail-actions">
              <button
                className="appt-detail-edit-btn"
                onClick={() => handleEdit(appointment)}
              >
                แก้ไข
              </button>
              {appointment.status === "รอพบแพทย์" && (
                <>
                  <button
                    className="appt-detail-cancel-btn"
                    onClick={() => handleChangeStatus(appointment.id, "ยกเลิก")}
                  >
                    ยกเลิกนัดหมาย
                  </button>
                  <button
                    className="appt-detail-submit-btn"
                    onClick={() =>
                      handleChangeStatus(appointment.id, "เสร็จสิ้น")
                    }
                  >
                    ยืนยันนัดหมาย
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppointmentDetailModal;

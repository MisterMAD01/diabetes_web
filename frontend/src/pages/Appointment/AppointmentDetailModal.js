import React from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AppointmentDetailModal.css";

const STATUS = {
  WAITING: "รอพบแพทย์",
  DONE: "เสร็จสิ้น",
  CANCELLED: "ยกเลิก",
};

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

const StatusBadge = ({ status }) => (
  <div className={`appt-detail-status-badge ${status}`}>{status}</div>
);

const AppointmentInfoBox = ({ appointment }) => (
  <div className="appt-detail-info-box appt-detail-status-box">
    <div>
      <p>
        <strong>{appointment.name}</strong>
      </p>
      <p>HN: {appointment.hn}</p>
    </div>
    <StatusBadge status={appointment.status} />
  </div>
);

const AppointmentDetailsGrid = ({ appointment }) => (
  <div className="appt-detail-grid">
    <div>
      <label>วันที่</label>
      <p>{formatDateThai(appointment.date)}</p>
    </div>
    <div>
      <label>แพทย์ผู้ดูแล</label>
      <p>{appointment.doctor || "-"}</p>
    </div>
    <div>
      <label>เวลา</label>
      <p>{formatTime(appointment.time)}</p>
    </div>
  </div>
);

const AppointmentActions = ({ appointment, onChangeStatus }) => {
  if (appointment.status !== STATUS.WAITING) return null;

  const handleChange = async (newStatus) => {
    try {
      await onChangeStatus(appointment.id, newStatus);
      toast.success(`สถานะนัดหมายเปลี่ยนเป็น "${newStatus}" เรียบร้อยแล้ว`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("เกิดข้อผิดพลาดในการเปลี่ยนสถานะ");
    }
  };

  return (
    <div className="appt-detail-actions">
      <button
        className="appt-detail-cancel-btn"
        onClick={() => handleChange(STATUS.CANCELLED)}
      >
        ยกเลิกนัดหมาย
      </button>
      <button
        className="appt-detail-submit-btn"
        onClick={() => handleChange(STATUS.DONE)}
      >
        ยืนยันนัดหมาย
      </button>
    </div>
  );
};

const AppointmentDetailModal = ({ appointment, onClose, onStatusChange }) => {
  if (!appointment) return null;

  return (
    <div className="appt-detail-overlay">
      <div className="appt-detail-container large">
        <div className="appt-detail-header">
          <h3>รายละเอียดนัดหมาย</h3>
          <button className="appt-detail-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="appt-detail-form">
          <AppointmentInfoBox appointment={appointment} />
          <AppointmentDetailsGrid appointment={appointment} />

          <div>
            <label>หมายเหตุ</label>
            <p>{appointment.note || "-"}</p>
          </div>

          <AppointmentActions
            appointment={appointment}
            onChangeStatus={onStatusChange}
          />
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailModal;

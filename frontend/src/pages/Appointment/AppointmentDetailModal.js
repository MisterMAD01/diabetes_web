// AppointmentDetailModal.jsx
import React from 'react';
import './AppointmentDetailModal';

const AppointmentDetailModal = ({ appointment, onClose, onStatusChange, onEdit }) => {
  const formatDateThai = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '-';
    return `${timeStr.slice(0, 5)} น.`;
  };

  return (
    <div className="modal-overlay">
      <div className="modal large">
        <div className="modal-header">
          <h3>รายละเอียดนัดหมาย</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-form">
          <div className="detail-box status-box">
            <div>
              <p><strong>{appointment.name}</strong></p>
              <p>HN: {appointment.hn}</p>
            </div>
            <div className={`status-badge ${appointment.status}`}>
              {appointment.status}
            </div>
          </div>
          <div className="modal-grid">
            <div>
  <label>แพทย์ผู้ดูแล</label>
  <p>{appointment.doctor || '-'}</p>
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
            <p>{appointment.note || '-'}</p>
          </div>
          <div className="modal-actions">
            {appointment.status === 'รอพบแพทย์' && (
              <>
                <button
                  className="submit-btn"
                  onClick={() => onStatusChange(appointment.id, 'เสร็จสิ้น')}
                >
                  ยืนยันนัดหมาย
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => onStatusChange(appointment.id, 'ยกเลิก')}
                >
                  ยกเลิกนัดหมาย
                </button>
              </>
            )}
            {/* ปุ่มแก้ไขแสดงได้ทุกสถานะ */}
            <button className="edit-btn" onClick={() => onEdit(appointment)}>
              แก้ไข
            </button>
            <button className="cancel-btn" onClick={onClose}>ปิด</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailModal;
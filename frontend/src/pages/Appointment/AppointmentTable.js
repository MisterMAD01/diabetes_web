import { formatTimeThai } from '../../components/utils';

// AppointmentTable.jsx
import React from 'react';

const AppointmentTable = ({ appointments, onEdit, onDelete, onView, allAppointments }) => {
  const formatDateThai = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

const statusClass = (status) => {
  switch (status) {
    case 'รอพบแพทย์':
      return 'badge-pending';
    case 'เสร็จสิ้น':
      return 'badge-success';
    case 'ยกเลิก':
      return 'badge-cancelled';
    default:
      return '';
  }
};

  return (
    <table className="appointment-table">
      <thead>
        <tr>
          <th>HN</th>
          <th>ชื่อ-สกุล</th>
          <th>แพทย์</th>
          <th>เวลา</th>
          <th>วันที่</th>
          <th>สถานะ</th>
          <th>การจัดการ</th>
        </tr>
      </thead>
      <tbody>
        {appointments.map((appt, idx) => (
          <tr key={idx}>
            <td>{appt.Patient_ID}</td>
            <td>{appt.Patient_Name}</td>
            <td>{appt.Doctor_Name || '[ไม่มีชื่อหมอ]'}</td>
            <td>{formatTimeThai(appt.Appointment_Time)}</td>
<td>{formatDateThai(appt.Appointment_Date)}</td>

            <td>
  <span className={`status-badge ${statusClass(appt.Status)}`}>
    {appt.Status}
  </span>
</td>

            <td className="table-actions">
              <button className="view" title="ดู" onClick={() => onView(appt)}>
                <i className="fas fa-eye"></i>
              </button>
              <button
                className="edit"
                title="แก้ไข"
                onClick={() => onEdit(allAppointments.indexOf(appt))}
              >
                <i className="fas fa-edit"></i>
              </button>
              <button
  className="delete"
  title="ลบ"
  onClick={() => onDelete(appt)}
>
  <i className="fas fa-trash-alt"></i>
</button>

            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AppointmentTable;

import React from 'react';
import '../../components/PopupColor/Popup.css';

const BlackPopup = ({ onClose, patients }) => (
  <div className="popup-overlay">
    <div className="popup-content black-popup">
      <button className="close-btn" onClick={onClose}>✖</button>
      <h2 className="popup-title">กลุ่มสีดำ</h2>
      <div className="symbol-circle symbol-circle-Black"></div>
      <p className="popup-description">กลุ่มผู้ป่วยที่มีภาวะแทรกซ้อนรุนแรง</p>
      <p className="patient-summary">จำนวนทั้งหมด: <strong>{patients.length}</strong> คน</p>
      <div className="patient-table-container">
        <table className="patient-table-popup">
          <thead>
            <tr><th>ลำดับ</th><th>HN</th><th>ชื่อ</th><th>เบอร์</th><th>อายุ</th></tr>
          </thead>
          <tbody>
            {patients.map((p, index) => (
              <tr key={p.id}>
                <td>{(index + 1).toString().padStart(3, '0')}</td>
                <td>{p.id}</td>
                <td>{p.fullname}</td>
                <td>{p.phone}</td>
                <td>{p.age}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default BlackPopup;

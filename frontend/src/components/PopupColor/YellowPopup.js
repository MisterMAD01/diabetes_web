import React from "react";
import "../../components/PopupColor/Popup.css";

const YellowPopup = ({ onClose, patients }) => (
  <div className="popup-overlay">
    <div className="popup-content yellow-popup">
      <button className="close-btn" onClick={onClose}>
        ✖
      </button>
      <h2 className="popup-title">กลุ่มผู้ป่วยระดับ 1 (สีเหลือง)</h2>
      <div className="symbol-circle symbol-circle-Yellow"></div>
      <p className="patient-summary">
        จำนวนทั้งหมด: <strong>{patients.length}</strong> คน
      </p>
      <div className="patient-table-container">
        <table className="patient-table-popup">
          <thead>
            <tr>
              <th>ลำดับ</th>
              <th>HN</th>
              <th>ชื่อ</th>
              <th>เพศ</th>
              <th>เบอร์</th>
              <th>อายุ</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p, index) => (
              <tr key={p.id}>
                <td>{(index + 1).toString().padStart(3, "0")}</td>
                <td>{p.id}</td>
                <td>{p.fullname}</td>
                <td>{p.gender}</td>
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

export default YellowPopup;

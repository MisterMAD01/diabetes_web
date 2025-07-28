import React from "react";
import "../../components/PopupColor/Popup.css";

const WhitePopup = ({ onClose, patients }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content white-popup">
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
        <h2 className="popup-title">กลุ่มปกติ (สีขาว)</h2>
        <div className="symbol-circle symbol-circle-White"></div>
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
};

export default WhitePopup;

import React, { useState } from "react";
import axios from "axios";
import "./DataManagement.css";

// ✅ นำเข้าไอคอนจาก Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserInjured,
  faCalendarAlt,
  faHeartbeat,
  faUser,
  faClock,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.REACT_APP_API;

const DataManagement = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [downloadLogs, setDownloadLogs] = useState([]);

  const handleDownload = async (type, label) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get(`${API_URL}/data/export/${type}`, {
        params,
        responseType: "blob",
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `${type}_data_${timestamp}.csv`;

      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setDownloadLogs((prev) => [
        { label, date: new Date().toLocaleString(), filename },
        ...prev,
      ]);
    } catch (error) {
      console.error("Download error:", error.response?.data || error.message);
      alert("เกิดข้อผิดพลาดในการดาวน์โหลดข้อมูล");
    }
  };

  return (
    <div className="data-container">
      <h2>
        <FontAwesomeIcon icon={faDownload} /> จัดการข้อมูลระบบ
      </h2>

      <div className="date-filters">
        <div className="input-group">
          <label>วันที่เริ่มต้น</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label>วันที่สิ้นสุด</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="button-group">
        <button onClick={() => handleDownload("patient", "ผู้ป่วย")}>
          <FontAwesomeIcon icon={faUserInjured} /> ดาวน์โหลดผู้ป่วย
        </button>
        <button onClick={() => handleDownload("appointments", "นัดหมาย")}>
          <FontAwesomeIcon icon={faCalendarAlt} /> ดาวน์โหลดนัดหมาย
        </button>
        <button onClick={() => handleDownload("health_data", "สุขภาพ")}>
          <FontAwesomeIcon icon={faHeartbeat} /> ดาวน์โหลดสุขภาพ
        </button>
        <button onClick={() => handleDownload("users", "ผู้ใช้")}>
          <FontAwesomeIcon icon={faUser} /> ดาวน์โหลดผู้ใช้
        </button>
      </div>

      <div className="log-section">
        <h3>📜 ประวัติการดาวน์โหลด</h3>
        {downloadLogs.length === 0 ? (
          <p className="log-empty">ยังไม่มีรายการ</p>
        ) : (
          <ul className="log-list">
            {downloadLogs.map((log, index) => (
              <li key={index}>
                <FontAwesomeIcon icon={faClock} /> {log.label} — {log.filename} ({log.date})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DataManagement;

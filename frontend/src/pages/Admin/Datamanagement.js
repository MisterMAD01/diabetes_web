import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import "./DataManagement.css";
import {
  faDatabase,
  faClock,
  faDownload,
  faFileImport,
  faExclamationTriangle,
  faList,
  faCalendarAlt,
  faUserInjured,
  faCalendarCheck,
  faHeartbeat,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import DataImportModal from "./DataImportModal"; // import modal นำเข้า

const API_URL = process.env.REACT_APP_API;

const DataManagement = () => {
  const { user, accessToken } = useContext(UserContext);
  const [selectedTables, setSelectedTables] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [logs, setLogs] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const navigate = useNavigate();

  const tables = [
    { key: "patient", label: "ผู้ป่วย", icon: faUserInjured },
    { key: "appointments", label: "นัดหมาย", icon: faCalendarCheck },
    { key: "health_data", label: "สุขภาพ", icon: faHeartbeat },
    { key: "users", label: "ผู้ใช้", icon: faUser },
  ];

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/history/download`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setLogs(res.data);
      } catch (error) {
        console.error("Failed to load download logs:", error);
      }
    };
    fetchLogs();
  }, [accessToken]);

  const toggleTable = (key) => {
    setSelectedTables((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleExport = async () => {
    setShowConfirm(false);
    try {
      for (const type of selectedTables) {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (user?.id) params.userId = user.id;

        const response = await axios.get(`${API_URL}/api/data/export/${type}`, {
          params,
          responseType: "blob",
          headers: { Authorization: `Bearer ${accessToken}` },
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

        setLogs((prev) => [
          {
            table_name: type,
            filename,
            download_date: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    } catch (error) {
      console.error("Download error:", error.message);
      alert("เกิดข้อผิดพลาดในการส่งออกข้อมูล");
    }
  };

  const handleConfirm = () => {
    if (selectedTables.length > 0) {
      setShowConfirm(true);
    }
  };

  return (
    <div className="data-container">
      <div className="header">
        <h2>
          <FontAwesomeIcon icon={faDatabase} /> จัดการข้อมูลระบบ
        </h2>
        <button
          className="import-page-button"
          onClick={() => setShowImportModal(true)}
        >
          <FontAwesomeIcon icon={faFileImport} /> นำเข้าข้อมูล
        </button>
      </div>

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

      <div className="checkbox-group">
        {tables.map((table) => (
          <label key={table.key} className="checkbox-item">
            <input
              type="checkbox"
              checked={selectedTables.includes(table.key)}
              onChange={() => toggleTable(table.key)}
            />
            <FontAwesomeIcon icon={table.icon} /> {table.label}
          </label>
        ))}
      </div>

      <button
        className="export-button"
        onClick={handleConfirm}
        disabled={selectedTables.length === 0}
      >
        <FontAwesomeIcon icon={faDownload} /> ส่งออกข้อมูลที่เลือก
      </button>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>
              <FontAwesomeIcon icon={faExclamationTriangle} /> ยืนยันการส่งออก
            </h3>
            <p>
              <FontAwesomeIcon icon={faList} /> คุณกำลังจะส่งออกข้อมูลดังต่อไปนี้:
            </p>
            <ul>
              {selectedTables.map((key) => {
                const t = tables.find((t) => t.key === key);
                return (
                  <li key={key}>
                    <FontAwesomeIcon icon={t.icon} /> {t?.label}
                  </li>
                );
              })}
            </ul>
            <p>
              <FontAwesomeIcon icon={faCalendarAlt} /> ช่วงวันที่: {startDate || "-"} ถึง{" "}
              {endDate || "-"}
            </p>
            <div className="modal-buttons">
              <button onClick={handleExport}>ยืนยัน</button>
              <button onClick={() => setShowConfirm(false)}>ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <DataImportModal
          onClose={() => setShowImportModal(false)}
          apiUrl={API_URL}
          accessToken={accessToken}
          typeOptions={tables}
        />
      )}

      <div className="log-section">
        <h3>
          <FontAwesomeIcon icon={faClock} /> ประวัติการดาวน์โหลด
        </h3>
        {logs.length === 0 ? (
          <p className="log-empty">ยังไม่มีรายการ</p>
        ) : (
          <ul className="log-list">
            {logs.map((log, index) => {
              const dateObj = new Date(log.download_date);
              const day = dateObj.getDate();
              const month = dateObj.getMonth() + 1;
              const year = dateObj.getFullYear() + 543;
              const time = dateObj.toLocaleTimeString("th-TH", {
                hour12: false,
              });

              return (
                <li key={index} className="log-item">
                  <FontAwesomeIcon icon={faClock} />{" "}
                  <strong>{log.table_name}</strong> — {log.filename} ({" "}
                  {`${day}/${month}/${year} ${time}`} )
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DataManagement;

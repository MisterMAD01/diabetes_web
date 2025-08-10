import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import "./DataManagement.css";
import {
  faDatabase,
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
import DataImportModal from "./DataImportModal";

const API_URL = process.env.REACT_APP_API;

const DataManagement = () => {
  const { user, accessToken } = useContext(UserContext);
  const [selectedTables, setSelectedTables] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [logs, setLogs] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [noData, setNoData] = useState(false);
  const navigate = useNavigate();

  const tables = [
    { key: "patient", label: "ผู้ป่วย", icon: faUserInjured },
    { key: "appointments", label: "นัดหมาย", icon: faCalendarCheck },
    { key: "health_data", label: "สุขภาพ", icon: faHeartbeat },
    { key: "users", label: "ผู้ใช้", icon: faUser },
  ];

  useEffect(() => {
    fetchDownloadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTable = (key) => {
    setSelectedTables((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const fetchDownloadLogs = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/data/download`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching download logs:", error);
    }
  };

  const resetLogs = async () => {
    try {
      await axios.delete(`${API_URL}/api/data/download`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setLogs([]);
    } catch (error) {
      console.error("Error resetting logs:", error);
      alert("ไม่สามารถลบประวัติได้");
    }
  };

  const handleExport = async () => {
    setShowConfirm(false);
    setNoData(false);
    try {
      let hasData = false;

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

        if (response.data.size === 0) continue;
        hasData = true;

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

        // บันทึก log ดาวน์โหลด
        try {
          await axios.post(
            `${API_URL}/api/data/download`,
            {
              user_id: user?.id,
              table_name: type,
              filename,
            },
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
        } catch (err) {
          console.error("Error saving download log:", err);
        }

        // อัพเดต log ในหน้า
        setLogs((prev) => [
          {
            table_name: type,
            filename,
            download_date: new Date().toISOString(),
            username: user?.username || "ไม่ระบุ",
          },
          ...prev,
        ]);
      }

      if (!hasData) {
        setNoData(true);
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
        <div className="title-group">
          <h2 className="data-title">จัดการข้อมูลระบบ</h2>
          <p className="data-subtitle">
            เลือกประเภทข้อมูลที่ต้องการเพื่อส่งออกข้อมูล
          </p>
        </div>

        <button
          className="import-page-button"
          onClick={() => setShowImportModal(true)}
        >
          <FontAwesomeIcon icon={faFileImport} /> นำเข้าข้อมูล
        </button>
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

      <p className="selected-count">
        รายการที่เลือก: {selectedTables.length} รายการ
      </p>

      <button
        className="export-button"
        onClick={handleConfirm}
        disabled={selectedTables.length === 0}
      >
        <FontAwesomeIcon icon={faDownload} /> ส่งออกข้อมูลที่เลือก
      </button>

      {noData && (
        <p className="warning-text">
          ⚠️ ไม่พบข้อมูลสำหรับช่วงวันที่ที่เลือก โปรดตรวจสอบอีกครั้ง
        </p>
      )}

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>
              <FontAwesomeIcon icon={faExclamationTriangle} /> ยืนยันการส่งออก
            </h3>
            <p>
              <FontAwesomeIcon icon={faList} />{" "}
              คุณกำลังจะส่งออกข้อมูลดังต่อไปนี้:
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
              <FontAwesomeIcon icon={faCalendarAlt} /> ช่วงวันที่:{" "}
              {startDate || "-"} ถึง {endDate || "-"}
            </p>
            <div className="modal-buttons">
              <button
                className="cancel-button"
                onClick={() => setShowConfirm(false)}
              >
                ยกเลิก
              </button>
              <button className="confirm-button" onClick={handleExport}>
                ยืนยัน
              </button>
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
      <div className="download-logs-section">
        <div className="header-row">
          <h3 className="download-logs-title">ประวัติการส่งออกข้อมูล</h3>
          <button className="reset-logs-button" onClick={resetLogs}>
            ล้างประวัติ
          </button>
        </div>

        {logs.length === 0 ? (
          <p>ยังไม่มีประวัติการส่งออกข้อมูล</p>
        ) : (
          <>
            <table className="download-logs-table">
              <thead>
                <tr>
                  <th>ชื่อไฟล์</th>
                  <th>ข้อมูล</th>
                  <th>วันที่ส่งออก</th>
                  <th>ชื่อผู้ใช้</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={index}>
                    <td>{log.filename}</td>
                    <td>{log.table_name}</td>
                    <td>{new Date(log.download_date).toLocaleString()}</td>
                    <td>{log.name || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default DataManagement;

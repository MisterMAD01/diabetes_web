import React, { useState, useContext } from "react";
import Papa from "papaparse";
import { UserContext } from "../../contexts/UserContext";
import DataImportConfirmModal from "./DataImportConfirmModal";
import "./DataImportModal.css";

const DataImportModal = ({ onClose, apiUrl }) => {
  const { accessToken } = useContext(UserContext);
  const [file, setFile] = useState(null);
  const [type, setType] = useState("patient");
  const [csvData, setCsvData] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const tables = [
    { key: "patient", label: "ผู้ป่วย" },
    { key: "appointments", label: "นัดหมาย" },
    { key: "health_data", label: "สุขภาพ" },
    { key: "users", label: "ผู้ใช้" },
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setMessage("");

    if (selectedFile) {
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setCsvData(results.data);
          setShowConfirmModal(true);
        },
        error: () => {
          setMessage("ไฟล์ CSV ไม่ถูกต้อง");
          setCsvData([]);
        },
      });
    }
  };

  const onConfirmSelection = (rows) => {
    setSelectedRows(rows);
    setShowConfirmModal(false);
  };

  const handleImportSubmit = async () => {
    if (selectedRows.length === 0) {
      setMessage("กรุณาเลือกข้อมูลก่อนนำเข้า");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      const csvString = Papa.unparse(selectedRows);
      const blob = new Blob([csvString], { type: "text/csv" });
      const newFile = new File([blob], "selected_data.csv", {
        type: "text/csv",
      });

      const formData = new FormData();
      formData.append("file", newFile);

      const res = await fetch(`${apiUrl}/api/data/import/${type}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "นำเข้าข้อมูลไม่สำเร็จ");

      setMessage(result.message || "นำเข้าข้อมูลสำเร็จ");
      setFile(null);
      setCsvData([]);
      setSelectedRows([]);
    } catch (error) {
      setMessage(error.message || "เกิดข้อผิดพลาดในการนำเข้า");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="import-modal-overlay">
      <div className="import-modal-container">
        <div className="import-modal-header">
          <h3>นำเข้าข้อมูล CSV</h3>
          <button className="import-modal-close-btn" onClick={onClose}>
            ✖
          </button>
        </div>

        <label>
          ประเภทข้อมูล:
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {tables.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          ไฟล์ CSV:
          <input type="file" accept=".csv" onChange={handleFileChange} />
        </label>

        {file && <p className="import-modal-filename">📄 {file.name}</p>}
        {message && <p className="import-modal-message">{message}</p>}

        <button
          className="import-modal-submit-btn"
          onClick={handleImportSubmit}
          disabled={loading}
        >
          {loading ? "กำลังนำเข้า..." : "นำเข้า"}
        </button>

        {showConfirmModal && (
          <DataImportConfirmModal
            data={csvData}
            onClose={() => setShowConfirmModal(false)}
            onConfirm={onConfirmSelection}
          />
        )}
      </div>
    </div>
  );
};

export default DataImportModal;

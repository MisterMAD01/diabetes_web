import React, { useState, useContext } from "react";
import Papa from "papaparse";
import { UserContext } from "../../contexts/UserContext";
import DataImportConfirmModal from "./DataImportConfirmModal";

const DataImportModal = ({ onClose, apiUrl, accessToken, typeOptions }) => {
  const [file, setFile] = useState(null);
  const [type, setType] = useState(typeOptions[0]?.key || "patient");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [csvData, setCsvData] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

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
          setShowConfirmModal(true); // เปิด modal ยืนยันหลังเลือกไฟล์
        },
        error: () => {
          setMessage("ไฟล์ CSV ไม่ถูกต้อง");
          setCsvData([]);
        },
      });
    }
  };

  const handleTypeChange = (e) => {
    setType(e.target.value);
    setMessage("");
    setCsvData([]);
    setFile(null);
  };

  const onConfirmSelection = (rows) => {
    setSelectedRows(rows);
    setShowConfirmModal(false);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (selectedRows.length === 0) {
      setMessage("กรุณาเลือกข้อมูลก่อนนำเข้า");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${apiUrl}/api/data/import/${type}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: selectedRows }),
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
    <div className="modal-overlay">
      <div className="modal import-modal">
        <div className="modal-header">
          <h3>นำเข้าข้อมูล CSV</h3>
          <button className="close-btn" onClick={onClose}>
            ✖
          </button>
        </div>

        <form onSubmit={handleImportSubmit}>
          <label>
            เลือกประเภทข้อมูล:
            <select value={type} onChange={handleTypeChange}>
              {typeOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            เลือกไฟล์ CSV:
            <input type="file" accept=".csv" onChange={handleFileChange} />
          </label>

          {file && <p>ไฟล์ที่เลือก: {file.name}</p>}

          {message && <p className="message">{message}</p>}

          {selectedRows.length > 0 && (
            <div className="preview-section">
              <h4>ข้อมูลที่เลือกนำเข้า ({selectedRows.length} แถว)</h4>
              <pre
                style={{
                  maxHeight: 200,
                  overflowY: "auto",
                  backgroundColor: "#f0f0f0",
                  padding: 10,
                }}
              >
                {JSON.stringify(selectedRows, null, 2)}
              </pre>
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "กำลังนำเข้า..." : "นำเข้า"}
          </button>
        </form>

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

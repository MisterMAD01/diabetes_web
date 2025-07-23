import React, { useState } from "react";
import "./DataImportConfirmModal.css";

const DataImportConfirmModal = ({ data, onClose, onConfirm }) => {
  const [checkedRows, setCheckedRows] = useState(data.map(() => true));

  const toggleRow = (idx) => {
    setCheckedRows((prev) => {
      const newChecked = [...prev];
      newChecked[idx] = !newChecked[idx];
      return newChecked;
    });
  };

  const handleConfirm = () => {
    const selectedData = data.filter((_, i) => checkedRows[i]);
    onConfirm(selectedData);
  };

  if (!data || data.length === 0)
    return (
      <div className="import-confirm-overlay">
        <div className="import-confirm-modal">
          <p>ไม่มีข้อมูลในไฟล์ CSV</p>
          <button onClick={onClose}>ปิด</button>
        </div>
      </div>
    );

  return (
    <div className="import-confirm-overlay">
      <div className="import-confirm-modal">
        <h3>เลือกแถวข้อมูลที่จะนำเข้า</h3>
        <div className="import-confirm-table-container">
          <table className="import-confirm-table">
            <thead>
              <tr>
                <th>เลือก</th>
                {Object.keys(data[0]).map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  <td>
                    <input
                      type="checkbox"
                      checked={checkedRows[i]}
                      onChange={() => toggleRow(i)}
                    />
                  </td>
                  {Object.values(row).map((val, idx) => (
                    <td key={idx}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="import-confirm-actions">
          <button className="btn-cancel" onClick={onClose}>
            ยกเลิก
          </button>
          <button className="btn-confirm" onClick={handleConfirm}>
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataImportConfirmModal;

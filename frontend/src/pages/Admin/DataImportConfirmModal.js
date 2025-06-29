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
      <div className="admin-modal-overlay">
        <div className="admin-modal">
          <p>ไม่มีข้อมูลในไฟล์ CSV</p>
          <button onClick={onClose}>ปิด</button>
        </div>
      </div>
    );

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal" style={{ maxHeight: "80vh", overflowY: "auto" }}>
        <h3>เลือกแถวข้อมูลที่จะนำเข้า</h3>
        <table>
          <thead>
            <tr>
              <th>เลือก</th>
              {data[0] &&
                Object.keys(data[0]).map((header) => (
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
        <div className="admin-modal-buttons">
          <button onClick={handleConfirm}>ยืนยัน</button>
          <button onClick={onClose}>ยกเลิก</button>
        </div>
      </div>
    </div>
  );
};

export default DataImportConfirmModal;

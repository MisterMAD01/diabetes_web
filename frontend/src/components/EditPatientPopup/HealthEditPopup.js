import React, { useState, useEffect } from "react";
import "./HealthEditPopup.css";
import { toast } from "react-toastify";

// ฟังก์ชันแปลงวันที่เป็นรูปแบบไทยพร้อมเวลา
function formatDateThai(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date)) return "";

  const monthsThai = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  const day = date.getDate();
  const month = monthsThai[date.getMonth()];
  const year = date.getFullYear() + 543; // แปลงเป็นปี พ.ศ.
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day} ${month} ${year} เวลา ${hours}:${minutes}น.`;
}

const HealthEditPopup = ({ record, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState(record || {});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setFormData(record || {});
    setShowDeleteConfirm(false);
  }, [record]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSave(formData);
    } catch (error) {
      toast.error("บันทึกข้อมูลล้มเหลว");
    }
  };

  const openDeleteConfirm = () => {
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const confirmDelete = async () => {
    if (onDelete) {
      try {
        await onDelete(record.Health_Data_ID);
        setShowDeleteConfirm(false);
      } catch (error) {
        toast.error("ลบข้อมูลล้มเหลว");
      }
    }
  };

  return (
    <div className="health-popup-overlay">
      <div className="health-popup-content">
        <h2>แก้ไขข้อมูลสุขภาพ</h2>
        <form onSubmit={handleSubmit} className="health-popup-form">
          <div className="health-popup-row">
            <div className="health-popup-group full">
              <label>วันที่บันทึก</label>
              <div>{formatDateThai(formData.Date_Recorded)}</div>
            </div>
          </div>

          <div className="health-popup-row">
            <div className="health-popup-group">
              <label>ระดับน้ำตาลในเลือด</label>
              <input
                type="number"
                step="0.1"
                name="Blood_Sugar"
                value={formData.Blood_Sugar || ""}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="health-popup-group">
              <label>ความดันโลหิตบน</label>
              <input
                type="number"
                name="Systolic_BP"
                value={formData.Systolic_BP || ""}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="health-popup-group">
              <label>ความดันโลหิตล่าง</label>
              <input
                type="number"
                name="Diastolic_BP"
                value={formData.Diastolic_BP || ""}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className="health-popup-row">
            <div className="health-popup-group">
              <label>น้ำหนัก (kg)</label>
              <input
                type="number"
                step="0.1"
                name="Weight"
                value={formData.Weight || ""}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="health-popup-group">
              <label>ส่วนสูง (cm)</label>
              <input
                type="number"
                name="Height"
                value={formData.Height || ""}
                onChange={handleChange}
                min="0"
                max="200"
              />
            </div>
            <div className="health-popup-group">
              <label>รอบเอว (cm)</label>
              <input
                type="number"
                step="0.1"
                name="Waist"
                value={formData.Waist || ""}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className="health-popup-row">
            <div className="health-popup-group">
              <label>สูบบุหรี่</label>
              <select
                name="Smoke"
                value={formData.Smoke || "ไม่สูบ"}
                onChange={handleChange}
              >
                <option value="ไม่สูบ">ไม่สูบ</option>
                <option value="สูบ">สูบ</option>
              </select>
            </div>

            <div className="health-popup-group">
              <label>สถานะเบาหวาน</label>
              <select
                name="Diabetes_Mellitus"
                value={formData.Diabetes_Mellitus || "ไม่ป่วยเป็นเบาหวาน"}
                onChange={handleChange}
              >
                <option value="ไม่ป่วยเป็นเบาหวาน">ไม่ป่วยเป็นเบาหวาน</option>
                <option value="ป่วยเป็นเบาหวาน">ป่วยเป็นเบาหวาน</option>
              </select>
            </div>
          </div>

          <div className="health-popup-group full">
            <label>หมายเหตุ</label>
            <textarea
              name="Note"
              value={formData.Note || ""}
              onChange={handleChange}
            />
          </div>

          <div className="health-popup-buttons">
            <button
              type="button"
              className="health-popup-cancel-btn"
              onClick={onClose}
            >
              ปิด
            </button>
            <button
              type="button"
              className="health-popup-danger-btn"
              onClick={openDeleteConfirm}
            >
              ลบข้อมูลสุขภาพ
            </button>

            <button type="submit" className="health-popup-submit-btn">
              บันทึก
            </button>
          </div>
        </form>

        {showDeleteConfirm && (
          <div className="confirm-delete-popup">
            <div className="confirm-delete-content">
              <p>คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลสุขภาพนี้?</p>

              <button onClick={cancelDelete} className="confirm-btn no">
                ยกเลิก
              </button>
              <button onClick={confirmDelete} className="confirm-btn yes">
                ตกลง
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthEditPopup;

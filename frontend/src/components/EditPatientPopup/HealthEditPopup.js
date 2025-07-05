import React, { useState, useEffect } from 'react';
import './EditPateintPage.css';

const HealthEditPopup = ({ record, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState(record || {});

  useEffect(() => {
    setFormData(record);
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
    await onSave(formData);
  };

  const handleDelete = () => {
    const confirmDelete = window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลสุขภาพนี้?');
    if (confirmDelete && onDelete) {
      onDelete(record.Health_Data_ID);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup large-popup">
        <h2>📝 แก้ไขข้อมูลสุขภาพ</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>วันที่บันทึก</label>
            <input
              type="date"
              name="Date_Recorded"
              value={formData.Date_Recorded || ''}
              readOnly
              disabled
            />
          </div>

          <div className="form-group">
            <label>ระดับน้ำตาล</label>
            <input
              type="number"
              step="0.1"
              name="Blood_Sugar"
              value={formData.Blood_Sugar || ''}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>ความดันโลหิตบน</label>
            <input
              type="number"
              name="Systolic_BP"
              value={formData.Systolic_BP || ''}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>ความดันโลหิตล่าง</label>
            <input
              type="number"
              name="Diastolic_BP"
              value={formData.Diastolic_BP || ''}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>น้ำหนัก (kg)</label>
            <input
              type="number"
              step="0.1"
              name="Weight"
              value={formData.Weight || ''}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>ส่วนสูง (cm)</label>
            <input
              type="number"
              name="Height"
              value={formData.Height || ''}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>รอบเอว (cm)</label>
            <input
              type="number"
              step="0.1"
              name="Waist"
              value={formData.Waist || ''}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>สูบบุหรี่</label>
            <select name="Smoke" value={formData.Smoke || 'ไม่สูบ'} onChange={handleChange}>
              <option value="ไม่สูบ">ไม่สูบ</option>
              <option value="สูบ">สูบ</option>
            </select>
          </div>

          <div className="form-group">
            <label>สถานะเบาหวาน</label>
            <select
              name="Diabetes_Mellitus"
              value={formData.Diabetes_Mellitus || 'ไม่ป่วยเป็นเบาหวาน'}
              onChange={handleChange}
            >
              <option value="ไม่ป่วยเป็นเบาหวาน">ไม่ป่วยเป็นเบาหวาน</option>
              <option value="ป่วยเป็นเบาหวาน">ป่วยเป็นเบาหวาน</option>
              <option value="เสี่ยงเป็นเบาหวาน">เสี่ยงเป็นเบาหวาน</option>
            </select>
          </div>

          <div className="form-group">
            <label>หมายเหตุ</label>
            <textarea name="Note" value={formData.Note || ''} onChange={handleChange} />
          </div>

          <div className="popup-buttons">
            <button type="button" onClick={onClose}>
              ปิด
            </button>
            <button type="submit">บันทึก</button>
            <button
              type="button"
              onClick={handleDelete}
              style={{ backgroundColor: 'red', color: 'white', marginLeft: '8px' }}
            >
              ลบข้อมูลสุขภาพ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HealthEditPopup;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDateThai } from '../utils'; // ปรับ path ตามที่จัดวางจริง

import HealthEditPopup from './HealthEditPopup';

const EditPatientPage = () => {
  const { id: patientId } = useParams();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API;

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    Underlying_Disease: '',
    address: '',
  });

  const [healthRecords, setHealthRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await fetch(`${API_URL}/api/patient-edit/${patientId}`);
        const data = await res.json();
        setFormData({
          name: data.P_Name || '',
          age: data.Age || '',
          phone: data.Phone_Number || '',
          Underlying_Disease: data.Underlying_Disease || '',
          address: data.Address || '',
        });
        setError(null);
      } catch (err) {
        setError('❌ ไม่สามารถโหลดข้อมูลผู้ป่วยได้');
      } finally {
        setLoading(false);
      }
    };

    const fetchHealth = async () => {
      try {
        const res = await fetch(`${API_URL}/api/patient-edit/health/${patientId}`);
        const data = await res.json();
        setHealthRecords(data);
      } catch (err) {
        console.error('❌ ไม่สามารถโหลดข้อมูลสุขภาพได้:', err);
      }
    };

    fetchPatient();
    fetchHealth();
  }, [API_URL, patientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_URL}/api/patient-edit/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Update failed');
      alert('✅ บันทึกข้อมูลเรียบร้อยแล้ว');
      navigate(-1);
    } catch (err) {
      alert('❌ เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ป่วยรายนี้?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_URL}/api/patient-edit/${patientId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('ลบไม่สำเร็จ');
      alert('✅ ลบผู้ป่วยเรียบร้อยแล้ว');
      navigate('/patients');
    } catch (err) {
      alert('❌ เกิดข้อผิดพลาดในการลบ');
      console.error(err);
    }
  };

  if (loading) return <div className="loading">⏳ กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="edit-patient-page">
      <h2>แก้ไขข้อมูลผู้ป่วย</h2>

      {['name', 'age', 'phone', 'Underlying_Disease', 'address'].map((field) => (
        <div className="form-group" key={field}>
          <label>{field.replace('_', ' ')}</label>
          <input name={field} value={formData[field]} onChange={handleChange} />
        </div>
      ))}

      <div className="form-buttons">
        <button onClick={handleSave}>บันทึก</button>
        <button onClick={() => navigate(-1)}>ย้อนกลับ</button>
        <button onClick={handleDelete} style={{ backgroundColor: 'red', color: 'white' }}>
          ลบผู้ป่วย
        </button>
      </div>

      <h3>ประวัติสุขภาพ</h3>
      <div className="card-list">
        {healthRecords.map((rec) => (
          <div
            key={rec.Health_Data_ID}
            className="health-card"
            onClick={() => setSelectedRecord(rec)}
          >
            {formatDateThai(rec.Date_Recorded)}
          </div>
        ))}
      </div>

{selectedRecord && (
  <HealthEditPopup
    record={selectedRecord}
    onClose={() => setSelectedRecord(null)}
    onSave={async (updatedRecord) => {
      const res = await fetch(`${API_URL}/api/patient-edit/health/${updatedRecord.Health_Data_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRecord),
      });
      if (res.ok) {
        alert('✅ อัปเดตข้อมูลสุขภาพเรียบร้อย');
        setSelectedRecord(null);
      }
    }}
      onDelete={async (id) => {
    const res = await fetch(`${API_URL}/api/patient-edit/health/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      alert('🗑️ ลบข้อมูลสุขภาพเรียบร้อยแล้ว');
      setSelectedRecord(null);
    }
  }}
  />
)}

    </div>
  );
};

export default EditPatientPage;

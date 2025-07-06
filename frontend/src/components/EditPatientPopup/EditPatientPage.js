import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDateThai, toDateInputValue } from '../utils';
import HealthEditPopup from './HealthEditPopup';
import './EditPateintPage.css'

const EditPatientPage = () => {
  const { id: patientId } = useParams();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API;

  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    address: '',
    village: '',
    subdistrict: '',
    district: '',
    province: '',
    birthdate: '',
    gender: '',
    phone: '',
    age: '',
    disease: '',
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

        const [firstName, ...restLast] = (data.P_Name || '').split(' ');
        const fullAddress = data.Address || '';
        const [addr, mo, tambon, amphur, province] = fullAddress.split(/ หมู่ | ต\.| อ\.| จ\./);

        setFormData({
          name: firstName || '',
          lastname: restLast.join(' ') || '',
          address: addr || '',
          village: mo || '',
          subdistrict: tambon || '',
          district: amphur || '',
          province: province || '',
          birthdate: data.Birthdate || '',
          gender: data.Gender || '',
          phone: data.Phone_Number || '',
          age: data.Age || '',
          disease: data.Underlying_Disease || '',
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const payload = {
      P_Name: `${formData.name} ${formData.lastname}`,
      Address: `${formData.address} หมู่ ${formData.village} ต.${formData.subdistrict} อ.${formData.district} จ.${formData.province}`,
      Phone_Number: formData.phone,
      Age: formData.age,
      Gender: formData.gender,
      Birthdate: formData.birthdate,
      Underlying_Disease: formData.disease || null,
    };

    try {
      const res = await fetch(`${API_URL}/api/patient-edit/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Update failed');
      alert('✅ บันทึกข้อมูลเรียบร้อยแล้ว');
      navigate(-1);
    } catch (err) {
      alert('❌ เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ป่วยรายนี้?')) return;
    try {
      const res = await fetch(`${API_URL}/api/patient-edit/${patientId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('ลบไม่สำเร็จ');
      alert('✅ ลบผู้ป่วยเรียบร้อยแล้ว');
      navigate('/patients');
    } catch (err) {
      alert('❌ เกิดข้อผิดพลาดในการลบ');
    }
  };

  if (loading) return <div className="loading">⏳ กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
<div className="edit-patient-page">
  <h2>แก้ไขข้อมูลผู้ป่วย</h2>

  <div className="edit-patient-row">
    <div className="edit-patient-group">
      <label>ชื่อ</label>
      <input name="name" value={formData.name} onChange={handleChange} />
    </div>
    <div className="edit-patient-group">
      <label>นามสกุล</label>
      <input name="lastname" value={formData.lastname} onChange={handleChange} />
    </div>
  </div>

  <div className="edit-patient-group">
    <label>ที่อยู่</label>
    <input name="address" value={formData.address} onChange={handleChange} />
  </div>

  <div className="edit-patient-row">
    <div className="edit-patient-group">
      <label>หมู่</label>
      <input name="village" value={formData.village} onChange={handleChange} />
    </div>
    <div className="edit-patient-group">
      <label>ตำบล</label>
      <input name="subdistrict" value={formData.subdistrict} onChange={handleChange} />
    </div>
    <div className="edit-patient-group">
      <label>อำเภอ</label>
      <input name="district" value={formData.district} onChange={handleChange} />
    </div>
    <div className="edit-patient-group">
      <label>จังหวัด</label>
      <input name="province" value={formData.province} onChange={handleChange} />
    </div>
  </div>

  <div className="edit-patient-row">
    <div className="edit-patient-group">
      <label>วันเกิด</label>
      <input
  type="date"
  name="birthdate"
  value={toDateInputValue(formData.birthdate)}
  onChange={handleChange}
/>
    </div>
    <div className="edit-patient-group">
      <label>เพศ</label>
      <select name="gender" value={formData.gender} onChange={handleChange}>
        <option value="">เลือกเพศ</option>
        <option value="ชาย">ชาย</option>
        <option value="หญิง">หญิง</option>
        <option value="อื่นๆ">อื่นๆ</option>
      </select>
    </div>
    <div className="edit-patient-group">
      <label>เบอร์โทร</label>
      <input name="phone" value={formData.phone} onChange={handleChange} />
    </div>
  </div>

  <div className="edit-patient-row">
    <div className="edit-patient-group">
      <label>อายุ</label>
      <input name="age" value={formData.age} onChange={handleChange} />
    </div>
    <div className="edit-patient-group">
      <label>โรคประจำตัว</label>
      <input name="disease" value={formData.disease} onChange={handleChange} />
    </div>
  </div>

<div className="edit-patient-buttons">
  <button onClick={handleSave} className="edit-patient-submit-btn">บันทึก</button>
  <button onClick={() => navigate(-1)} className="edit-patient-cancel-btn">ย้อนกลับ</button>
  <button onClick={handleDelete} className="edit-patient-danger-btn">ลบผู้ป่วย</button>
</div>

      <h3>ประวัติสุขภาพ</h3>
      <div className="card-list">
        {healthRecords.map((rec) => (
          <div key={rec.Health_Data_ID} className="health-card" onClick={() => setSelectedRecord(rec)}>
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
              // รีโหลดข้อมูลใหม่
              const resHealth = await fetch(`${API_URL}/api/patient-edit/health/${patientId}`);
              const data = await resHealth.json();
              setHealthRecords(data);
            }
          }}
          onDelete={async (id) => {
            const res = await fetch(`${API_URL}/api/patient-edit/health/${id}`, {
              method: 'DELETE',
            });
            if (res.ok) {
              alert('🗑️ ลบข้อมูลสุขภาพเรียบร้อยแล้ว');
              setSelectedRecord(null);
              const resHealth = await fetch(`${API_URL}/api/patient-edit/health/${patientId}`);
              const data = await resHealth.json();
              setHealthRecords(data);
            }
          }}
        />
      )}
    </div>
  );
};

export default EditPatientPage;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatDateThaiNew, formatTimeThai1, toDateInputValue } from "../utils";
import HealthEditPopup from "./HealthEditPopup";
import { toast } from "react-toastify";
import "./EditPateintPage.css";

const EditPatientPage = () => {
  const { id: patientId } = useParams();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API;

  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    address: "",
    village: "",
    subdistrict: "",
    district: "",
    province: "",
    birthdate: "",
    gender: "",
    phone: "",
    age: "",
    disease: "",
  });

  const [healthRecords, setHealthRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // State สำหรับ confirm ลบผู้ป่วย
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await fetch(`${API_URL}/api/patient-edit/${patientId}`);
        const data = await res.json();

        const [firstName, ...restLast] = (data.P_Name || "").split(" ");
        const fullAddress = data.Address || "";
        const [addr, mo, tambon, amphur, province] = fullAddress.split(
          / หมู่ | ต\.| อ\.| จ\./
        );

        setFormData({
          name: firstName || "",
          lastname: restLast.join(" ") || "",
          address: addr || "",
          village: mo || "",
          subdistrict: tambon || "",
          district: amphur || "",
          province: province || "",
          birthdate: data.Birthdate || "",
          gender: data.Gender || "",
          phone: data.Phone_Number || "",
          age: data.Age || "",
          disease: data.Underlying_Disease || "",
        });
        setError(null);
      } catch (err) {
        setError("ไม่สามารถโหลดข้อมูลผู้ป่วยได้");
      } finally {
        setLoading(false);
      }
    };

    const fetchHealth = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/patient-edit/health/${patientId}`
        );
        const data = await res.json();
        setHealthRecords(data);
      } catch (err) {
        console.error("ไม่สามารถโหลดข้อมูลสุขภาพได้:", err);
      }
    };

    fetchPatient();
    fetchHealth();
  }, [API_URL, patientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ฟังก์ชันตรวจสอบข้อมูลฟอร์มก่อนบันทึก
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("กรุณากรอกชื่อ");
      return false;
    }
    if (!formData.lastname.trim()) {
      toast.error("กรุณากรอกนามสกุล");
      return false;
    }
    if (!formData.address.trim()) {
      toast.error("กรุณากรอกที่อยู่");
      return false;
    }
    if (!formData.village.trim()) {
      toast.error("กรุณากรอกหมู่");
      return false;
    }
    if (!formData.subdistrict.trim()) {
      toast.error("กรุณากรอกตำบล");
      return false;
    }
    if (!formData.district.trim()) {
      toast.error("กรุณากรอกอำเภอ");
      return false;
    }
    if (!formData.province.trim()) {
      toast.error("กรุณากรอกจังหวัด");
      return false;
    }
    if (!formData.birthdate) {
      toast.error("กรุณาเลือกวันเกิด");
      return false;
    }
    if (!formData.gender) {
      toast.error("กรุณาเลือกเพศ");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("กรุณากรอกเบอร์โทร");
      return false;
    }
    // ตรวจสอบเบอร์โทรศัพท์ต้องเป็น 10 หลัก เท่านั้น
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("กรุณากรอกเบอร์โทรให้ถูกต้อง 10 หลัก)");
      return false;
    }

    if (!String(formData.age).trim()) {
      toast.error("กรุณากรอกอายุ");
      return false;
    }
    const ageNum = Number(formData.age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      toast.error("กรุณากรอกอายุเป็นตัวเลขระหว่าง 1 ถึง 120");
      return false;
    }
    // disease เป็น optional ไม่บังคับ
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);

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
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Update failed");
      }
      toast.success("แก้ไขข้อมูลผู้ป่วยเรียบร้อยแล้ว");
      navigate(-1);
    } catch (err) {
      toast.error(`เกิดข้อผิดพลาดในการบันทึก: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/api/patient-edit/${patientId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("ลบไม่สำเร็จ");
      toast.success("ลบผู้ป่วยเรียบร้อยแล้ว");
      navigate("/patients");
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการลบ");
    }
  };

  if (loading) return <div className="loading">กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="edit-patient-page">
      <h2>แก้ไขข้อมูลผู้ป่วย</h2>

      <div className="edit-patient-row">
        <div className="edit-patient-group">
          <label>ชื่อ</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="กรอกชื่อ"
          />
        </div>
        <div className="edit-patient-group">
          <label>นามสกุล</label>
          <input
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            placeholder="กรอกนามสกุล"
          />
        </div>
      </div>

      <div className="edit-patient-group">
        <label>บ้านเลขที่</label>
        <input
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="กรอกบ้านเลขที่"
        />
      </div>

      <div className="edit-patient-row">
        <div className="edit-patient-group">
          <label>หมู่</label>
          <input
            name="village"
            value={formData.village}
            onChange={handleChange}
            placeholder="กรอกหมู่"
          />
        </div>
        <div className="edit-patient-group">
          <label>ตำบล</label>
          <input
            name="subdistrict"
            value={formData.subdistrict}
            onChange={handleChange}
            placeholder="กรอกตำบล"
          />
        </div>
        <div className="edit-patient-group">
          <label>อำเภอ</label>
          <input
            name="district"
            value={formData.district}
            onChange={handleChange}
            placeholder="กรอกอำเภอ"
          />
        </div>
        <div className="edit-patient-group">
          <label>จังหวัด</label>
          <input
            name="province"
            value={formData.province}
            onChange={handleChange}
            placeholder="กรอกจังหวัด"
          />
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
            placeholder="เลือกวันเกิด"
          />
        </div>
        <div className="edit-patient-group">
          <label>เพศ</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            placeholder="เลือกเพศ"
          >
            <option value="">เลือกเพศ</option>
            <option value="ชาย">ชาย</option>
            <option value="หญิง">หญิง</option>
          </select>
        </div>
        <div className="edit-patient-group">
          <label>เบอร์โทร</label>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="กรอกเบอร์โทร 10 หลัก"
          />
        </div>
      </div>

      <div className="edit-patient-row">
        <div className="edit-patient-group">
          <label>อายุ</label>
          <input
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="กรอกอายุ"
          />
        </div>
        <div className="edit-patient-group">
          <label>โรคประจำตัว</label>
          <input
            name="disease"
            value={formData.disease}
            onChange={handleChange}
            placeholder="กรอกโรคประจำตัว (ถ้ามี)"
          />
        </div>
      </div>

      <div className="edit-patient-buttons">
        <button
          onClick={handleSave}
          className="edit-patient-submit-btn"
          disabled={saving}
        >
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
        <button
          onClick={() => navigate(-1)}
          className="edit-patient-cancel-btn"
          disabled={saving}
        >
          ย้อนกลับ
        </button>
        <button
          onClick={confirmDelete}
          className="edit-patient-danger-btn"
          disabled={saving}
        >
          ลบผู้ป่วย
        </button>
      </div>

      {/* Confirm Delete Popup */}
      {showDeleteConfirm && (
        <div className="confirm-delete-popup">
          <div className="confirm-delete-content">
            <p>คุณแน่ใจหรือไม่ว่าต้องการลบผู้ป่วยรายนี้?</p>

            <button onClick={cancelDelete} className="confirm-btn no">
              ยกเลิก
            </button>
            <button onClick={handleDelete} className="confirm-btn yes">
              ตกลง
            </button>
          </div>
        </div>
      )}

      <h3>ประวัติสุขภาพ</h3>
      <div className="card-list">
        {healthRecords.map((rec) => (
          <div
            key={rec.Health_Data_ID}
            className="health-card"
            onClick={() => setSelectedRecord(rec)}
          >
            {formatDateThaiNew(rec.Date_Recorded)} เวลา{" "}
            {formatTimeThai1(rec.Date_Recorded)}
          </div>
        ))}
      </div>

      {selectedRecord && (
        <HealthEditPopup
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onSave={async (updatedRecord) => {
            const res = await fetch(
              `${API_URL}/api/patient-edit/health/${updatedRecord.Health_Data_ID}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedRecord),
              }
            );
            if (res.ok) {
              toast.success("อัปเดตข้อมูลสุขภาพเรียบร้อย");
              setSelectedRecord(null);
              // รีโหลดข้อมูลใหม่
              const resHealth = await fetch(
                `${API_URL}/api/patient-edit/health/${patientId}`
              );
              const data = await resHealth.json();
              setHealthRecords(data);
            }
          }}
          onDelete={async (id) => {
            const res = await fetch(
              `${API_URL}/api/patient-edit/health/${id}`,
              {
                method: "DELETE",
              }
            );
            if (res.ok) {
              toast.success("ลบข้อมูลสุขภาพเรียบร้อยแล้ว");
              setSelectedRecord(null);
              const resHealth = await fetch(
                `${API_URL}/api/patient-edit/health/${patientId}`
              );
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

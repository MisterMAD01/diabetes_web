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

  const [formErrors, setFormErrors] = useState({});
  const [healthRecords, setHealthRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await fetch(`${API_URL}/api/patient-edit/${patientId}`);
        const data = await res.json();

        // แยกชื่อและนามสกุลจาก P_Name
        const [firstName, ...restLast] = (data.P_Name || "").split(" ");

        // แยก address ตามรูปแบบ "ที่อยู่ หมู่ ... ต. ... อ. ... จ. ..."
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
    setFormErrors((prev) => ({ ...prev, [name]: "" })); // clear error on change
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = "กรุณากรอกชื่อ";
    if (!formData.lastname.trim()) errors.lastname = "กรุณากรอกนามสกุล";
    if (!formData.address.trim()) errors.address = "กรุณากรอกที่อยู่";
    if (!formData.village.trim()) errors.village = "กรุณากรอกหมู่";
    if (!formData.subdistrict.trim()) errors.subdistrict = "กรุณากรอกตำบล";
    if (!formData.district.trim()) errors.district = "กรุณากรอกอำเภอ";
    if (!formData.province.trim()) errors.province = "กรุณากรอกจังหวัด";
    if (!formData.birthdate) errors.birthdate = "กรุณาเลือกวันเกิด";
    if (!formData.gender) errors.gender = "กรุณาเลือกเพศ";

    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.phone.trim()) errors.phone = "กรุณากรอกเบอร์โทร";
    else if (!phoneRegex.test(formData.phone))
      errors.phone = "กรุณากรอกเบอร์โทร 10 หลัก";

    const age = Number(formData.age);
    if (
      formData.age === "" ||
      formData.age === null ||
      formData.age === undefined
    ) {
      errors.age = "กรุณากรอกอายุ";
    } else if (isNaN(age) || age < 1 || age > 150)
      errors.age = "อายุควรอยู่ระหว่าง 1 - 150 ปี";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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

      if (!res.ok) throw new Error("เกิดข้อผิดพลาดในการบันทึก");

      toast.success("บันทึกสำเร็จ");
      navigate(-1);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => setShowDeleteConfirm(true);
  const cancelDelete = () => setShowDeleteConfirm(false);

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

  const renderInput = (label, name, placeholder, type = "text") => (
    <div className="edit-patient-group">
      <label>{label}</label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
      />
      {formErrors[name] && (
        <small className="error-text">{formErrors[name]}</small>
      )}
    </div>
  );

  return (
    <div className="edit-patient-page">
      <h2>แก้ไขข้อมูลผู้ป่วย</h2>

      <div className="edit-patient-row">
        {renderInput("ชื่อ", "name", "กรอกชื่อ")}
        {renderInput("นามสกุล", "lastname", "กรอกนามสกุล")}
      </div>

      {renderInput("บ้านเลขที่", "address", "กรอกบ้านเลขที่")}

      <div className="edit-patient-row">
        {renderInput("หมู่", "village", "กรอกหมู่")}
        {renderInput("ตำบล", "subdistrict", "กรอกตำบล")}
        {renderInput("อำเภอ", "district", "กรอกอำเภอ")}
        {renderInput("จังหวัด", "province", "กรอกจังหวัด")}
      </div>

      <div className="edit-patient-row">
        <div className="edit-patient-group">
          <label>วันเกิด</label>
          <input
            type="date"
            name="birthdate"
            value={toDateInputValue(formData.birthdate)}
            onChange={handleChange}
            max={new Date().toISOString().split("T")[0]}
          />
          {formErrors.birthdate && (
            <small className="error-text">{formErrors.birthdate}</small>
          )}
        </div>

        <div className="edit-patient-group">
          <label>เพศ</label>
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="">เลือกเพศ</option>
            <option value="ชาย">ชาย</option>
            <option value="หญิง">หญิง</option>
          </select>
          {formErrors.gender && (
            <small className="error-text">{formErrors.gender}</small>
          )}
        </div>

        {renderInput("เบอร์โทร", "phone", "กรอกเบอร์โทร", "text")}
      </div>

      <div className="edit-patient-row">
        {renderInput("อายุ", "age", "กรอกอายุ", "text")}
        {renderInput("โรคประจำตัว", "disease", "กรอกโรคประจำตัว (ถ้ามี)")}
      </div>

      <div className="edit-patient-buttons">
        <button
          onClick={confirmDelete}
          className="edit-patient-danger-btn"
          disabled={saving}
        >
          ลบผู้ป่วย
        </button>

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
      </div>

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

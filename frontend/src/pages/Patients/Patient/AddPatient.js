import React, { useState } from "react";
import { toast } from "react-toastify";
import "./AddPatient.css";

const API_URL = process.env.REACT_APP_API;

const AddPatient = ({ onSuccess, closePopup }) => {
  const [formData, setFormData] = useState({
    citizen_id: "",
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

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateFormData = () => {
    const newErrors = {};
    const nameRegex = /^[ก-๙a-zA-Z\s]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    const addressRegex = /^[0-9]+(\/[0-9A-Za-z]+)?$/;
    const villageRegex = /^[0-9]+$/;
    const citizenIdRegex = /^[0-9]{13}$/;

    const ageNum = Number(formData.age);
    const today = new Date();
    const birthDateObj = new Date(formData.birthdate);

    if (!formData.citizen_id.trim()) {
      newErrors.citizen_id = "กรุณากรอกเลขบัตรประชาชน";
    } else if (!citizenIdRegex.test(formData.citizen_id)) {
      newErrors.citizen_id = "เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก";
    }

    if (!formData.name.trim()) {
      newErrors.name = "กรุณากรอกชื่อ";
    } else if (!nameRegex.test(formData.name)) {
      newErrors.name = "ชื่อกรุณากรอกเป็นตัวอักษร";
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = "กรุณากรอกนามสกุล";
    } else if (!nameRegex.test(formData.lastname)) {
      newErrors.lastname = "นามสกุลกรุณากรอกเป็นตัวอักษร";
    }

    if (!formData.address.trim()) {
      newErrors.address = "กรุณากรอกบ้านเลขที่";
    } else if (!addressRegex.test(formData.address)) {
      newErrors.address = "บ้านเลขที่ควรอยู่ในรูปแบบตัวเลข เช่น 17 หรือ 17/4";
    }

    if (!formData.village.trim()) {
      newErrors.village = "กรุณากรอกหมู่";
    } else if (!villageRegex.test(formData.village)) {
      newErrors.village = "หมู่ต้องเป็นตัวเลขเท่านั้น";
    }

    if (!formData.subdistrict.trim()) {
      newErrors.subdistrict = "กรุณากรอกตำบล";
    } else if (!nameRegex.test(formData.subdistrict)) {
      newErrors.subdistrict = "ตำบลต้องเป็นตัวอักษร";
    }

    if (!formData.district.trim()) {
      newErrors.district = "กรุณากรอกอำเภอ";
    } else if (!nameRegex.test(formData.district)) {
      newErrors.district = "อำเภอต้องเป็นตัวอักษร";
    }

    if (!formData.province.trim()) {
      newErrors.province = "กรุณากรอกจังหวัด";
    } else if (!nameRegex.test(formData.province)) {
      newErrors.province = "จังหวัดต้องเป็นตัวอักษร";
    }

    if (!formData.birthdate) {
      newErrors.birthdate = "กรุณาเลือกวันเกิด";
    } else if (birthDateObj > today) {
      newErrors.birthdate = "วันเกิดต้องไม่เป็นวันในอนาคต";
    }

    if (!formData.gender) {
      newErrors.gender = "กรุณาเลือกเพศ";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "กรุณากรอกเบอร์โทรศัพท์";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก";
    }

    if (!formData.age.trim()) {
      newErrors.age = "กรุณากรอกอายุ";
    } else if (!Number.isInteger(ageNum) || ageNum <= 0 || ageNum > 150) {
      newErrors.age = "อายุต้องเป็นตัวเลขตั้งแต่ 1 ถึง 150";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateFormData();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("กรุณาแก้ไขข้อผิดพลาดในฟอร์ม");
      return;
    }

    const payload = {
      Citizen_ID: formData.citizen_id,
      P_Name: `${formData.name} ${formData.lastname}`,
      Address: `${formData.address} หมู่ ${formData.village} ต.${formData.subdistrict} อ.${formData.district} จ.${formData.province}`,
      Phone_Number: formData.phone,
      Age: formData.age,
      Gender: formData.gender,
      Birthdate: formData.birthdate,
      Underlying_Disease: formData.disease || null,
    };

    try {
      const res = await fetch(`${API_URL}/api/patient/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }

      toast.success("บันทึกข้อมูลสำเร็จ");
      onSuccess?.();
      closePopup?.();
    } catch (err) {
      toast.error(`${err.message}`);
    }
  };

  return (
    <div className="add-patient-popup-overlay">
      <div className="add-patient-popup-content">
        <button className="add-patient-close-btn" onClick={closePopup}>
          ✖
        </button>
        <div className="add-patient-form-container">
          <h2>เพิ่มข้อมูลผู้ป่วย</h2>
          <form onSubmit={handleSubmit}>
            <div className="add-patient-form-row">
              <div
                style={{ flex: 1, display: "flex", flexDirection: "column" }}
              >
                <input
                  type="text"
                  name="name"
                  placeholder="ชื่อ"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                {errors.name && (
                  <div className="input-error">{errors.name}</div>
                )}
              </div>
              <div
                style={{ flex: 1, display: "flex", flexDirection: "column" }}
              >
                <input
                  type="text"
                  name="lastname"
                  placeholder="นามสกุล"
                  value={formData.lastname}
                  onChange={handleChange}
                  required
                />
                {errors.lastname && (
                  <div className="input-error">{errors.lastname}</div>
                )}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <input
                type="text"
                name="citizen_id"
                placeholder="เลขบัตรประชาชน 13 หลัก"
                value={formData.citizen_id}
                onChange={handleChange}
                maxLength={13}
                required
              />
              {errors.citizen_id && (
                <div className="input-error">{errors.citizen_id}</div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <input
                type="text"
                name="address"
                placeholder="บ้านเลขที่"
                value={formData.address}
                onChange={handleChange}
                required
                pattern="[0-9]+(/[\w\d]+)?"
              />
              {errors.address && (
                <div className="input-error">{errors.address}</div>
              )}
            </div>

            <div className="add-patient-form-row">
              {["village", "subdistrict", "district", "province"].map(
                (field) => (
                  <div
                    key={field}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <input
                      type={field === "village" ? "number" : "text"}
                      name={field}
                      placeholder={
                        field === "village"
                          ? "หมู่"
                          : field === "subdistrict"
                          ? "ตำบล"
                          : field === "district"
                          ? "อำเภอ"
                          : "จังหวัด"
                      }
                      value={formData[field]}
                      onChange={handleChange}
                      required
                      {...(field === "village" && { min: 1, step: 1 })}
                    />
                    {errors[field] && (
                      <div className="input-error">{errors[field]}</div>
                    )}
                  </div>
                )
              )}
            </div>

            <div className="add-patient-form-row">
              <div
                style={{ flex: 1, display: "flex", flexDirection: "column" }}
              >
                <input
                  type="date"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                  required
                />
                {errors.birthdate && (
                  <div className="input-error">{errors.birthdate}</div>
                )}
              </div>
              <div
                style={{ flex: 1, display: "flex", flexDirection: "column" }}
              >
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">เพศ</option>
                  <option value="ชาย">ชาย</option>
                  <option value="หญิง">หญิง</option>
                </select>
                {errors.gender && (
                  <div className="input-error">{errors.gender}</div>
                )}
              </div>
              <div
                style={{ flex: 1, display: "flex", flexDirection: "column" }}
              >
                <input
                  type="number"
                  name="phone"
                  placeholder="เบอร์โทรติดต่อ"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                {errors.phone && (
                  <div className="input-error">{errors.phone}</div>
                )}
              </div>
            </div>

            <div className="add-patient-form-row">
              <div
                style={{ flex: 1, display: "flex", flexDirection: "column" }}
              >
                <input
                  type="number"
                  name="age"
                  placeholder="อายุ"
                  value={formData.age}
                  onChange={handleChange}
                  required
                />
                {errors.age && <div className="input-error">{errors.age}</div>}
              </div>
              <input
                type="text"
                name="disease"
                placeholder="โรคประจำตัว"
                value={formData.disease}
                onChange={handleChange}
              />
            </div>

            <button className="add-patient-submit-btn" type="submit">
              บันทึกข้อมูล
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPatient;

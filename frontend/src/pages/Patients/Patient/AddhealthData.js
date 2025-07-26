import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AddPatient.css";

const API_URL = process.env.REACT_APP_API;

// ฟังก์ชันช่วยแปลงวันที่ปัจจุบันเป็นรูปแบบ datetime-local (YYYY-MM-DDTHH:mm)
const getCurrentDateTimeLocal = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

const AddHealthData = ({ patientId, onSuccess, closePopup }) => {
  const [formData, setFormData] = useState({
    Systolic_BP: "",
    Diastolic_BP: "",
    Blood_Sugar: "",
    Height: "",
    Weight: "",
    Waist: "",
    Note: "",
    Diabetes_Mellitus: "ไม่ป่วยเป็นเบาหวาน",
    Smoke: "ไม่สูบ",
    Date_Recorded: getCurrentDateTimeLocal(), // ตั้งวันที่และเวลาปัจจุบันเป็นค่าเริ่มต้น
  });

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;

    if (type === "checkbox") {
      if (name === "Diabetes_Mellitus") {
        setFormData((prev) => ({
          ...prev,
          [name]: checked ? "ป่วยเป็นเบาหวาน" : "ไม่ป่วยเป็นเบาหวาน",
        }));
      } else if (name === "Smoke") {
        setFormData((prev) => ({
          ...prev,
          [name]: checked ? "สูบ" : "ไม่สูบ",
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.Date_Recorded) {
      toast.error("กรุณาเลือกวันที่และเวลา");
      return;
    }

    // แปลง 'YYYY-MM-DDTHH:mm' เป็น 'YYYY-MM-DD HH:mm:ss'
    const dateRecordedWithTime =
      formData.Date_Recorded.replace("T", " ") + ":00";

    const systolic = parseInt(formData.Systolic_BP, 10);
    const diastolic = parseInt(formData.Diastolic_BP, 10);
    if (isNaN(systolic) || isNaN(diastolic)) {
      toast.error("กรุณาระบุค่าความดันโลหิตให้ถูกต้อง");
      return;
    }

    const payload = {
      Systolic_BP: systolic,
      Diastolic_BP: diastolic,
      Blood_Sugar: parseFloat(formData.Blood_Sugar) || 0,
      Height: parseFloat(formData.Height) || 0,
      Weight: parseFloat(formData.Weight) || 0,
      Waist: parseFloat(formData.Waist) || 0,
      Note: formData.Note,
      Diabetes_Mellitus: formData.Diabetes_Mellitus,
      Smoke: formData.Smoke,
      Date_Recorded: dateRecordedWithTime,
    };

    try {
      await fetch(`${API_URL}/api/patient/${patientId}/health`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      await fetch(`${API_URL}/api/patient/${patientId}/update-color`, {
        method: "POST",
      });

      toast.success("บันทึกข้อมูลสุขภาพสำเร็จ");
      onSuccess?.();
      closePopup?.();
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด");
      console.error(err);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="add-patient-popup-overlay">
        <div className="add-patient-popup-content">
          <button className="add-patient-close-btn" onClick={closePopup}>
            ✖
          </button>
          <div className="add-patient-form-container">
            <h2>บันทึกข้อมูลสุขภาพ</h2>
            <div className="add-patient-form-row">
              <label htmlFor="Date_Recorded" style={{ marginRight: "10px" }}>
                วันที่บันทึกสุขภาพ:
              </label>
              <input
                type="datetime-local"
                id="Date_Recorded"
                name="Date_Recorded"
                value={formData.Date_Recorded}
                onChange={handleChange}
                max={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="add-patient-form-row">
                <input
                  type="number"
                  name="Systolic_BP"
                  placeholder="ความดันโลหิดบน (SBP)"
                  onChange={handleChange}
                  required
                  min="1"
                />
                <input
                  type="number"
                  name="Diastolic_BP"
                  placeholder="ความดันโลหิดล่าง (DBA)"
                  onChange={handleChange}
                  required
                  min="1"
                />
                <input
                  type="number"
                  step="0.1"
                  name="Blood_Sugar"
                  placeholder="น้ำตาลในเลือด (mg/dL)"
                  onChange={handleChange}
                  min="1"
                />
              </div>

              <div className="add-patient-form-row">
                <input
                  type="number"
                  step="0.1"
                  name="Height"
                  placeholder="ส่วนสูง (cm)"
                  onChange={handleChange}
                  min="1"
                  max="250"
                />
                <input
                  type="number"
                  step="0.1"
                  name="Weight"
                  placeholder="น้ำหนัก (kg)"
                  onChange={handleChange}
                  min="1"
                  max="200"
                  required
                />
                <input
                  type="number"
                  step="0.1"
                  name="Waist"
                  placeholder="รอบเอว (cm)"
                  onChange={handleChange}
                  min="1"
                />
              </div>

              <label className="add-patient-checkbox">
                <input
                  type="checkbox"
                  name="Diabetes_Mellitus"
                  checked={formData.Diabetes_Mellitus === "ป่วยเป็นเบาหวาน"}
                  onChange={handleChange}
                />{" "}
                เป็นเบาหวาน
              </label>

              <label className="add-patient-checkbox">
                <input
                  type="checkbox"
                  name="Smoke"
                  checked={formData.Smoke === "สูบ"}
                  onChange={handleChange}
                />{" "}
                สูบบุหรี่
              </label>

              <textarea
                name="Note"
                placeholder="หมายเหตุ"
                onChange={handleChange}
                className="add-patient-textarea"
              />
              <button className="add-patient-submit-btn" type="submit">
                บันทึก
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddHealthData;

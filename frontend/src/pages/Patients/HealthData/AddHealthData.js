import React, { useState } from "react";
import { toast } from "react-toastify";

const API_URL = process.env.REACT_APP_API;

const AddHealthData = () => {
  const [formData, setFormData] = useState({
    patientId: "",
    date: "",
    bloodSugar: "",
    systolicBP: "",
    diastolicBP: "",
    weight: "",
    height: "",
    waist: "",
    smoke: "ไม่สูบ",
    diabetesMellitus: "ไม่ป่วยเป็นเบาหวาน",
    note: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/healthRecordRoutes/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("บันทึกข้อมูลสุขภาพสำเร็จ!");
        setFormData({
          patientId: "",
          date: "",
          bloodSugar: "",
          systolicBP: "",
          diastolicBP: "",
          weight: "",
          height: "",
          waist: "",
          smoke: "ไม่สูบ",
          diabetesMellitus: "ไม่ป่วยเป็นเบาหวาน",
          note: "",
        });
      } else {
        toast.error("เกิดข้อผิดพลาด: " + (result.error || "ไม่ทราบสาเหตุ"));
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>เพิ่มข้อมูลสุขภาพ</h2>
      <form onSubmit={handleSubmit}>
        <label>
          รหัสผู้ป่วย:
          <input
            type="number"
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </label>
        <label>
          วันที่บันทึก:
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </label>
        <label>
          ระดับน้ำตาลในเลือด:
          <input
            type="number"
            step="0.1"
            name="bloodSugar"
            value={formData.bloodSugar}
            onChange={handleChange}
            disabled={loading}
          />
        </label>
        <label>
          ความดันโลหิตบน:
          <input
            type="number"
            name="systolicBP"
            value={formData.systolicBP}
            onChange={handleChange}
            disabled={loading}
          />
        </label>
        <label>
          ความดันโลหิตล่าง:
          <input
            type="number"
            name="diastolicBP"
            value={formData.diastolicBP}
            onChange={handleChange}
            disabled={loading}
          />
        </label>
        <label>
          น้ำหนัก (kg):
          <input
            type="number"
            step="0.1"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            disabled={loading}
          />
        </label>
        <label>
          ส่วนสูง (cm):
          <input
            type="number"
            name="height"
            value={formData.height}
            onChange={handleChange}
            disabled={loading}
          />
        </label>
        <label>
          รอบเอว (cm):
          <input
            type="number"
            step="0.1"
            name="waist"
            value={formData.waist}
            onChange={handleChange}
            disabled={loading}
          />
        </label>
        <label>
          สูบบุหรี่:
          <select
            name="smoke"
            value={formData.smoke}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="ไม่สูบ">ไม่สูบ</option>
            <option value="สูบ">สูบ</option>
          </select>
        </label>
        <label>
          สถานะเบาหวาน:
          <select
            name="diabetesMellitus"
            value={formData.diabetesMellitus}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="ไม่ป่วยเป็นเบาหวาน">ไม่ป่วยเป็นเบาหวาน</option>
            <option value="ป่วยเป็นเบาหวาน">ป่วยเป็นเบาหวาน</option>
            <option value="เสี่ยงเป็นเบาหวาน">เสี่ยงเป็นเบาหวาน</option>
          </select>
        </label>
        <label>
          หมายเหตุ:
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            disabled={loading}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
        </button>
      </form>
    </div>
  );
};

export default AddHealthData;

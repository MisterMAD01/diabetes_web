import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./AdditionalInfo.css";
import logo from "../../../assets/Logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.REACT_APP_API;

function AdditionalInfo() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [googleData, setGoogleData] = useState(null);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // ดึงข้อมูล googleRegister จาก localStorage (ที่มาจาก GoogleRegister.js)
    const googleRegisterData = JSON.parse(localStorage.getItem("googleRegister"));
    if (googleRegisterData) {
      setGoogleData(googleRegisterData);
    } else {
      // ถ้าเข้า url นี้ตรงๆ ให้กลับไป /login
      navigate("/login");
    }
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!googleData) return;

    const completeData = { ...googleData, ...formData };

    try {
      const response = await axios.post(`${API_URL}/api/auth/google/register`, completeData);
      setMessage(response.data.message);
      // ลบข้อมูล googleRegister เมื่อสมัครสำเร็จ
      localStorage.removeItem("googleRegister");
      // redirect ไปหน้า login หลัง 2 วินาที
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || "เกิดข้อผิดพลาดในการลงทะเบียน");
    }
  };

  return (
    <div className="additional-bg">
      <div className="additional-container">
        <div className="additional-logo-area">
          <img src={logo} alt="Logo" className="additional-logo-img" />
          <div className="additional-app-name">Diabetes Web System</div>
          <div className="additional-app-desc">ระบบจัดการเบาหวานสำหรับคลินิกและผู้ป่วย</div>
        </div>
        <h2 className="additional-title">กรอกข้อมูลเพิ่มเติม</h2>
        <form onSubmit={handleSubmit}>
          <div className="additional-input-wrapper">
            <span className="additional-input-icon">
              <FontAwesomeIcon icon={faUser} />
            </span>
            <input
              className="additional-input"
              type="text"
              name="username"
              placeholder="ชื่อผู้ใช้ (Username)"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>
          <div className="additional-input-wrapper">
            <span className="additional-input-icon">
              <FontAwesomeIcon icon={faLock} />
            </span>
            <input
              className="additional-input"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="รหัสผ่าน"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
            <span
              className="additional-input-eye"
              onClick={() => setShowPassword((show) => !show)}
              title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              tabIndex={0}
              role="button"
              aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </span>
          </div>
          <button className="additional-btn" type="submit">
            สมัครสมาชิก
          </button>
        </form>

        {message && <div className="additional-message">{message}</div>}

        <div className="additional-back-link">
          <p>
            <Link to="/register">ย้อนกลับ</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdditionalInfo;

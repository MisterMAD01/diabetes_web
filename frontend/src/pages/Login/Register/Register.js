import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";
import logo from "../../../assets/Logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faLock,
  faEnvelope,
  faIdCard,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.REACT_APP_API;

function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "username") {
      // แปลงเป็นพิมพ์เล็ก และลบตัวอักษรที่ไม่ใช่ a-z, 0-9, _
      const formatted = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: formatted,
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (firstName.trim() === "" || lastName.trim() === "") {
      setMessage("กรุณากรอกชื่อและนามสกุลให้ครบ");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      name: `${firstName.trim()} ${lastName.trim()}`,
    }));

    setMessage("");
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    if (formData.username.trim() === "") {
      setMessage("กรุณากรอกชื่อผู้ใช้");
      return;
    }
    if (formData.email.trim() === "") {
      setMessage("กรุณากรอกอีเมล");
      return;
    }
    if (formData.password === "") {
      setMessage("กรุณากรอกรหัสผ่าน");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = formData;
      const response = await axios.post(
        `${API_URL}/api/auth/register`,
        submitData
      );
      setMessage(response.data.message);
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "ฝั่งเซิร์ฟเวอร์ยังไม่พร้อมทำงาน"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-bg">
      <div className="register-container">
        <div className="register-logo-area">
          <img src={logo} alt="Logo" className="register-logo-img" />
          <div className="register-app-name">Diabetes Web System</div>
          <div className="register-app-desc">
            ระบบจัดการเบาหวานสำหรับคลินิกและผู้ป่วย
          </div>
        </div>
        <h2 className="register-title">สมัครสมาชิก</h2>

        {step === 1 && (
          <form className="register-form" onSubmit={handleNext}>
            <div className="register-input-wrapper">
              <span className="register-input-icon">
                <FontAwesomeIcon icon={faIdCard} />
              </span>
              <input
                className="register-input"
                type="text"
                name="firstName"
                placeholder="ชื่อ"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="register-input-wrapper">
              <span className="register-input-icon">
                <FontAwesomeIcon icon={faIdCard} />
              </span>
              <input
                className="register-input"
                type="text"
                name="lastName"
                placeholder="นามสกุล"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <button className="register-btn" type="submit">
              ถัดไป
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="register-form" onSubmit={handleRegister}>
            <div className="register-input-wrapper">
              <span className="register-input-icon">
                <FontAwesomeIcon icon={faUser} />
              </span>
              <input
                className="register-input"
                type="text"
                name="username"
                placeholder="ชื่อผู้ใช้ (Username)"
                value={formData.username}
                onChange={handleChange}
                required
                autoComplete="username"
              />
            </div>
            <div className="register-input-wrapper">
              <span className="register-input-icon">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              <input
                className="register-input"
                type="email"
                name="email"
                placeholder="อีเมล"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
            <div className="register-input-wrapper">
              <span className="register-input-icon">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input
                className="register-input"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="รหัสผ่าน"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <span
                className="register-input-eye"
                onClick={() => setShowPassword((prev) => !prev)}
                title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            </div>
            <div className="register-input-wrapper">
              <span className="register-input-icon">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input
                className="register-input"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="ยืนยันรหัสผ่าน"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <span
                className="register-input-eye"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                title={showConfirmPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                <FontAwesomeIcon
                  icon={showConfirmPassword ? faEyeSlash : faEye}
                />
              </span>
            </div>
            <button className="register-btn" type="submit" disabled={loading}>
              {loading ? "กำลังสมัครสมาชิก..." : "ลงทะเบียน"}
            </button>
            <button
              type="button"
              className="register-btn"
              onClick={() => {
                setStep(1);
                setMessage("");
              }}
            >
              กลับ
            </button>
          </form>
        )}

        {message && <div className="register-message">{message}</div>}

        <div className="register-back-to-login">
          <p>
            มีบัญชีอยู่แล้ว? <Link to="/login">เข้าสู่ระบบ</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;

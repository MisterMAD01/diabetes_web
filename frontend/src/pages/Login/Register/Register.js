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
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/register`,
        formData
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
              <FontAwesomeIcon icon={faIdCard} />
            </span>
            <input
              className="register-input"
              type="text"
              name="name"
              placeholder="ชื่อ-นามสกุล"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
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
              onClick={() => setShowPassword((show) => !show)}
              title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              tabIndex={0}
              role="button"
              aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </span>
          </div>
          <button className="register-btn" type="submit" disabled={loading}>
            {loading ? "กำลังสมัครสมาชิก..." : "ลงทะเบียน"}
          </button>
        </form>

        <div className="register-divider">หรือ</div>

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

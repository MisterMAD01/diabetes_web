import React, { useState } from "react";
import axios from "axios";
import GoogleLogin from "./GoogleLogin";
import { Link } from "react-router-dom";
import "./Login.css";
import logo from "../../../assets/Logo.png";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faLock,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.REACT_APP_API;

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

function Login() {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const loginData = {
      identifier: formData.identifier,
      password: formData.password,
    };

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        loginData,
        { withCredentials: true }
      );
      const token = response.data.token;
      localStorage.setItem("token", token);

      const decoded = parseJwt(token);
      localStorage.setItem("role", decoded?.role);

      window.location.href = "/home";
    } catch (error) {
      setMessage(
        error.response?.data?.message || "ฝั่งเซิร์ฟเวอร์ยังไม่พร้อมทำงาน"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-container">
        <div className="login-logo-area">
          <img src={logo} alt="Logo" className="login-logo-img" />
          <div className="login-app-name">Diabetes Web System</div>
          <div className="login-app-desc">
            ระบบจัดการเบาหวานสำหรับคลินิกและผู้ป่วย
          </div>
        </div>
        <h2 className="login-title">เข้าสู่ระบบ</h2>
        <form className="login-header" onSubmit={handleLogin}>
          <div className="login-input-wrapper">
            <span className="login-input-icon">
              <FontAwesomeIcon icon={faUser} />
            </span>
            <input
              className="login-input"
              type="text"
              name="identifier"
              placeholder="ชื่อผู้ใช้ หรือ อีเมล"
              value={formData.identifier}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>
          <div className="login-input-wrapper">
            <span className="login-input-icon">
              <FontAwesomeIcon icon={faLock} />
            </span>
            <input
              className="login-input"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="รหัสผ่าน"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
            <span
              className="login-input-eye"
              onClick={() => setShowPassword((show) => !show)}
              title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              tabIndex={0}
              role="button"
              aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </span>
          </div>
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <div className="register-divider">หรือ</div>
        <div className="login-google-container">
          <GoogleLogin setMessage={setMessage} />
        </div>

        {message && <div className="login-message">{message}</div>}

        <div className="login-register-link">
          <p>
            ยังไม่มีบัญชีใช่ไหม? <Link to="/register">สมัครสมาชิก</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

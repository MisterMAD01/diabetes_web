import React from "react";
import { useNavigate } from "react-router-dom";
import "./WelcomePage.css";
import logo from "../../assets/Logo.png"; // ใส่โลโก้ถ้ามี

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-page__wrapper">
      <div className="welcome-page__box">
<img src={logo} alt="Logo" className="welcome-page__logo" />
        <h1 className="welcome-page__title">Diabetes Management System</h1>
        <p className="welcome-page__subtitle">ยินดีต้อนรับสู่ระบบจัดการโรคเบาหวาน</p>
        <div className="welcome-page__buttons">
          <button
            onClick={() => navigate("/login")}
            className="welcome-page__btn welcome-page__btn--login"
          >
            เข้าสู่ระบบ
          </button>
        </div>
        {/* เพิ่มปุ่ม Google ได้ที่นี่ (ถ้าต้องการ) */}
      </div>
    </div>
  );
};

export default WelcomePage;

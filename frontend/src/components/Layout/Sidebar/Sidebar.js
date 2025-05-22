import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../contexts/UserContext";
import "./Sidebar.css";
import logo from "../../../assets/Logo.png";

const Sidebar = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext); // ✅ ใช้ context
  const role = user?.role;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="Logo" className="sidebar-logo" />
        <div>
          <h1>รพ.สต.โคกเคียน</h1>
          <p className="sidebar-sub">ระบบจัดการผู้ป่วยเบาหวาน</p>
        </div>
      </div>

      <nav className="sidebar-menu">
        <button onClick={() => navigate("/home")}>
          <i className="fas fa-home"></i> หน้าหลัก
        </button>
        {role === "admin" && (
          <button onClick={() => navigate("/manage-users")}>
            <i className="fas fa-user-cog"></i> จัดการผู้ใช้
          </button>
        )}
        <button onClick={() => navigate("/patients")}>
          <i className="fas fa-notes-medical"></i> ข้อมูลผู้ป่วย
        </button>
        <button onClick={() => navigate("/appointments")}>
          <i className="fas fa-calendar-alt"></i> การนัดหมาย
        </button>
        <button onClick={() => navigate("/risk-group")}>
          <i className="fas fa-exclamation-triangle"></i> กลุ่มเสี่ยง
        </button>
        <button onClick={() => navigate("/reports")}>
          <i className="fas fa-chart-bar"></i> รายงานผล
        </button>
        <button onClick={() => navigate("/export")}>
          <i className="fas fa-file-export"></i> Export ข้อมูล
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;

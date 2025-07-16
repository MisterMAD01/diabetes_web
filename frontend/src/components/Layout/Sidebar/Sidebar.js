import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../../../contexts/UserContext";
import "./Sidebar.css";
import logo from "../../../assets/Logo.png";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserContext);
  const role = user?.role;

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="sb-wrapper">
      <div className="sb-header">
        <img src={logo} alt="Logo" className="sb-logo" />
        <div>
          <h1 className="sb-title">รพ.สต.โคกเคียน</h1>
          <p className="sb-subtitle">ระบบติดตามสุขภาพผู้ป่วยเบาหวาน</p>
        </div>
      </div>

      <nav className="sb-menu">
        <button
          onClick={() => navigate("/home")}
          className={isActive("/home") ? "sb-active" : ""}
        >
          <i className="fas fa-home"></i> หน้าหลัก
        </button>

        {role === "admin" && (
          <>
            <button
              onClick={() => navigate("/manage-users")}
              className={isActive("/manage-users") ? "sb-active" : ""}
            >
              <i className="fas fa-user-cog"></i> จัดการผู้ใช้
            </button>
            <button
              onClick={() => navigate("/data-management")}
              className={isActive("/data-management") ? "sb-active" : ""}
            >
              <i className="fas fa-database"></i> จัดการข้อมูล
            </button>
          </>
        )}

        <button
          onClick={() => navigate("/patients")}
          className={isActive("/patients") ? "sb-active" : ""}
        >
          <i className="fas fa-notes-medical"></i> ข้อมูลผู้ป่วย
        </button>
        <button
          onClick={() => navigate("/appointments")}
          className={isActive("/appointments") ? "sb-active" : ""}
        >
          <i className="fas fa-calendar-alt"></i> การนัดหมาย
        </button>
        <button
          onClick={() => navigate("/risk-group")}
          className={isActive("/risk-group") ? "sb-active" : ""}
        >
          <i className="fas fa-exclamation-triangle"></i> กลุ่มเสี่ยง
        </button>
        <button
          onClick={() => navigate("/reports")}
          className={isActive("/reports") ? "sb-active" : ""}
        >
          <i className="fas fa-chart-bar"></i> รายงานผล
        </button>
        <button
          onClick={() => navigate("/export")}
          className={isActive("/export") ? "sb-active" : ""}
        >
          <i className="fas fa-file-export"></i> Export ข้อมูล
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;

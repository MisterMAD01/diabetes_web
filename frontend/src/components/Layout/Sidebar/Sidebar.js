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
    <div className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="Logo" className="sidebar-logo" />
        <div>
          <h1>รพ.สต.โคกเคียน</h1>
          <p className="sidebar-sub">ระบบติดตามสุขภาพผู้ป่วยเบาหวาน</p>
        </div>
      </div>

      <nav className="sidebar-menu">
        <button
          onClick={() => navigate("/home")}
          className={isActive("/home") ? "active" : ""}
        >
          <i className="fas fa-home"></i> หน้าหลัก
        </button>

        {role === "admin" && (
          <>
            <button
              onClick={() => navigate("/manage-users")}
              className={isActive("/manage-users") ? "active" : ""}
            >
              <i className="fas fa-user-cog"></i> จัดการผู้ใช้
            </button>
            <button
              onClick={() => navigate("/data-management")}
              className={isActive("/data-management") ? "active" : ""}
            >
              <i className="fas fa-database"></i> จัดการข้อมูล
            </button>
          </>
        )}

        <button
          onClick={() => navigate("/patients")}
          className={isActive("/patients") ? "active" : ""}
        >
          <i className="fas fa-notes-medical"></i> ข้อมูลผู้ป่วย
        </button>
        <button
          onClick={() => navigate("/appointments")}
          className={isActive("/appointments") ? "active" : ""}
        >
          <i className="fas fa-calendar-alt"></i> การนัดหมาย
        </button>
        <button
          onClick={() => navigate("/risk-group")}
          className={isActive("/risk-group") ? "active" : ""}
        >
          <i className="fas fa-exclamation-triangle"></i> กลุ่มเสี่ยง
        </button>
        <button
          onClick={() => navigate("/reports")}
          className={isActive("/reports") ? "active" : ""}
        >
          <i className="fas fa-chart-bar"></i> รายงานผล
        </button>
        <button
          onClick={() => navigate("/export")}
          className={isActive("/export") ? "active" : ""}
        >
          <i className="fas fa-file-export"></i> Export ข้อมูล
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;

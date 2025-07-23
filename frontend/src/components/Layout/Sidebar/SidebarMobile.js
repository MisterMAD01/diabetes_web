import React, { useContext, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../../../contexts/UserContext";
import "./SidebarMobile.css";
import logo from "../../../assets/Logo.png";

const menuItems = [
  { path: "/home", label: "หน้าหลัก", iconClass: "fas fa-home" },
  {
    path: "/manage-users",
    label: "จัดการผู้ใช้",
    iconClass: "fas fa-user-cog",
    roles: ["admin"],
  },
  {
    path: "/data-management",
    label: "จัดการข้อมูล",
    iconClass: "fas fa-database",
    roles: ["admin"],
  },
  {
    path: "/patients",
    label: "ข้อมูลผู้ป่วย",
    iconClass: "fas fa-notes-medical",
  },
  {
    path: "/appointments",
    label: "การนัดหมาย",
    iconClass: "fas fa-calendar-alt",
  },
  {
    path: "/risk-group",
    label: "กลุ่มเสี่ยง",
    iconClass: "fas fa-exclamation-triangle",
  },
  { path: "/reports", label: "รายงานผล", iconClass: "fas fa-chart-bar" },
  { path: "/export", label: "Export ข้อมูล", iconClass: "fas fa-file-export" },
];

const SidebarMobile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserContext);
  const role = user?.role;

  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);

  const filteredMenu = menuItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  const isActive = (path) => location.pathname.startsWith(path);

  // ปิดเมนูถ้าคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest(".mobile-menu-btn")
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      <button
        className="mobile-menu-btn"
        aria-label={isOpen ? "ปิดเมนู" : "เปิดเมนู"}
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className="fas fa-bars mobile-menu-icon"></i>
      </button>

      <div
        ref={sidebarRef}
        className={`sidebar-mobile ${isOpen ? "open" : "closed"}`}
      >
        <div className="sb-header-mobile">
          <img src={logo} alt="Logo" className="sb-logo-mobile" />
          <div>
            <h1 className="sb-title-mobile">รพ.สต.โคกเคียน</h1>
            <p className="sb-subtitle-mobile">ระบบติดตามสุขภาพผู้ป่วยเบาหวาน</p>
          </div>
        </div>

        <nav className="sb-menu-mobile">
          {filteredMenu.map(({ path, label, iconClass }) => (
            <button
              key={path}
              onClick={() => {
                navigate(path);
                setIsOpen(false);
              }}
              className={isActive(path) ? "sb-active" : ""}
            >
              <i className={iconClass}></i> {label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

export default SidebarMobile;

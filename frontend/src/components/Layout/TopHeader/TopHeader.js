import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../contexts/UserContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import "./TopHeader.css";

const TopHeader = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const navigate = useNavigate();
  const { user, logout, loadingUser } = useContext(UserContext);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const formattedDate = now.toLocaleDateString("th-TH", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      setCurrentTime(formattedDate);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // ปิด dropdown เมื่อเลือกเมนู
  const handleManageAccount = () => {
    setIsDropdownOpen(false);
    navigate("/user/profile");
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const getInitial = (name) => {
    return name ? name.trim().charAt(0).toUpperCase() : "?";
  };

  // ปิด dropdown เมื่อคลิกข้างนอก (optional/เพิ่มความสมบูรณ์)
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector(".user-dropdown");
      if (
        isDropdownOpen &&
        dropdown &&
        !dropdown.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className="header-bar">
      <div className="header-date">{currentTime}</div>
      <div className="header-user">
        <div className="user-dropdown">
          {user?.picture ? (
            <img
              src={user.picture}
              alt="avatar"
              className="user-avatar-img"
              onClick={toggleDropdown}
            />
          ) : (
            <div className="user-avatar-initial" onClick={toggleDropdown}>
              {loadingUser ? "?" : getInitial(user?.name)}
            </div>
          )}
          <span className="user-displayname">{loadingUser ? "" : user?.name || "ไม่พบข้อมูล"}</span>
          <button className="dropdown-toggle-btn" onClick={toggleDropdown}>
            <FontAwesomeIcon icon={isDropdownOpen ? faCaretUp : faCaretDown} />
          </button>
          {isDropdownOpen && (
            <div className="user-dropdown-menu">
              <button onClick={handleManageAccount}>โปรไฟล์ของฉัน</button>
              <button onClick={handleLogout}>ออกจากระบบ</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopHeader;

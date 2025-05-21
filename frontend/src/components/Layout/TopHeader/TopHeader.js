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

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleManageAccount = () => {
    navigate("/user/profile");
  };

  const getInitial = (name) => {
    return name ? name.trim().charAt(0).toUpperCase() : "?";
  };

  return (
    <div className="top-header">
      <div className="logo-header">
        <span>{currentTime}</span>
      </div>

      <div className="user-info1">
        <div className="dropdown">
          {user?.picture ? (
            <img
              src={user.picture}
              alt="avatar"
              className="user-avatar-mini"
              onClick={toggleDropdown}
            />
          ) : (
            <div className="avatar-circle" onClick={toggleDropdown}>
              {loadingUser ? "?" : getInitial(user?.name)}
            </div>
          )}

          <span>{loadingUser ? "" : user?.name || "ไม่พบข้อมูล"}</span>
          <button className="dropdown-btn" onClick={toggleDropdown}>
            <FontAwesomeIcon icon={isDropdownOpen ? faCaretUp : faCaretDown} />
          </button>

          {isDropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={handleManageAccount}>โปรไฟล์ของฉัน</button>
              <button onClick={logout}>ออกจากระบบ</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopHeader;

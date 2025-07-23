import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar/Sidebar";
import TopHeader from "./TopHeader/TopHeader";
import "./Layout.css";

const Layout = ({ children }) => {
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        setUserRole(decoded.role);
      } catch (error) {
        console.error("Error decoding token:", error);
        setUserRole(null);
      }
    }
  }, []);

  const excludedPaths = ["/", "/login", "/register"];
  const showLayout = !excludedPaths.includes(location.pathname);

  return (
    <div className="app-layout">
      {showLayout && <Sidebar role={userRole} />}
      <div className="layout-main">
        {showLayout && <TopHeader />}
        <main className="layout-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;

// src/pages/user/UserProfilePage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import UserProfile from "../frontend/src/components/user/UserProfile"; // ดึงจาก components
import "./UserProfilePage.css";

function UserProfilePage() {
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState("");

  const fetchUserData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUserData(response.data);
    } catch (err) {
      setMessage("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.patch("http://localhost:5000/api/users/me", userData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessage("ข้อมูลถูกอัปเดตสำเร็จ");
    } catch (err) {
      setMessage("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div className="user-profile-page">
      {message && <p className="message">{message}</p>}
      {userData ? (
        <UserProfile
          userData={userData}
          handleUpdate={handleUpdate}
          setUserData={setUserData}
        />
      ) : (
        <p>กำลังโหลดข้อมูล...</p>
      )}
    </div>
  );
}

export default UserProfilePage;

import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = process.env.REACT_APP_API;

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem("token") || null);
  const [loadingUser, setLoadingUser] = useState(true);
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout error:", err.message);
    }
    localStorage.removeItem("token");
    setAccessToken(null);
    setUser(null);
    navigate("/login");
  };

  const refreshAccessTokenAndLoadUser = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/refresh-token`, {}, {
        withCredentials: true,
      });
      const token = res.data.token;
      setAccessToken(token);
      localStorage.setItem("token", token);

      const userRes = await axios.get(`${API_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ เพิ่ม full URL ให้กับรูปภาพหากมี
      const profile = userRes.data.profile;
      if (profile.picture) {
        profile.picture = `${API_URL}/api/user/uploads/${profile.picture}`;
      }

      setUser(profile);
    } catch (err) {
      console.error("โหลด token หรือผู้ใช้ล้มเหลว:", err.message);
      logout();
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    refreshAccessTokenAndLoadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAdmin = user?.role === "admin";
  const isUser = user?.role === "user";

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        accessToken,
        setAccessToken,
        logout,
        loadingUser,
        isAdmin,
        isUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import useLogout from "../hooks/useLogout";

const API_URL = process.env.REACT_APP_API;

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem("token") || null);
  const [loadingUser, setLoadingUser] = useState(true);
  const logoutAndNavigate = useLogout();

  const logout = () => {
    logoutAndNavigate();
    setAccessToken(null);
    setUser(null);
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
      setUser(userRes.data.profile);
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

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        accessToken,
        setAccessToken,
        logout,
        loadingUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

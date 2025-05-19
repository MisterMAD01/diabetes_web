import React, { useEffect } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API;
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

function GoogleLogin({ setMessage }) {
  useEffect(() => {
    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: handleCallbackResponse,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("google-login-button"),
      { theme: "outline", size: "large" }
    );
  }, []);

  const handleCallbackResponse = async (response) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/auth/google/login`,
        { googleIdToken: response.credential },
        { withCredentials: true } // ✅ ส่ง cookie (refresh token)
      );

      const token = res.data.token;
      localStorage.setItem("token", token);

      const decoded = parseJwt(token);
      localStorage.setItem("role", decoded?.role);

      window.location.href = "/home";
    } catch (error) {
      setMessage?.(error.response?.data?.message || "Google Login Failed!");
    }
  };

  return (
    <div>
      <h2>Login with Google</h2>
      <div id="google-login-button"></div>
    </div>
  );
}

export default GoogleLogin;

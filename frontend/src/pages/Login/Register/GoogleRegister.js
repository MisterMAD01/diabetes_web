import React, { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom"; // ✅ เพิ่ม useNavigate

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function GoogleRegister() {
  const navigate = useNavigate(); // ✅ ใช้ React Router สำหรับ redirect

  const handleCallbackResponse = (response) => {
    if (!response.credential) {
      alert("ไม่สามารถรับข้อมูลจาก Google ได้");
      return;
    }

    const user = jwtDecode(response.credential);
    console.log("Google JWT User:", user);

    // ✅ บันทึกข้อมูล Google user ลง localStorage
    localStorage.setItem(
      "googleRegister",
      JSON.stringify({
        googleIdToken: response.credential,
        name: user.name,
        email: user.email,
        picture: user.picture,
      })
    );

    // ✅ หน่วงเล็กน้อยเพื่อให้ localStorage เขียนเสร็จก่อน redirect
    setTimeout(() => {
      navigate("/additional-info");
    }, 100);
  };

  useEffect(() => {
    if (!CLIENT_ID || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: handleCallbackResponse,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("google-register-button"),
      { theme: "outline", size: "large" }
    );
  }, []);

  return (
    <div className="google-register-box">
      <h2>สมัครสมาชิกด้วย Google</h2>
      <div id="google-register-button"></div>
    </div>
  );
}

export default GoogleRegister;

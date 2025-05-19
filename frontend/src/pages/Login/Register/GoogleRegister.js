import React, { useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function GoogleRegister() {
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

const handleCallbackResponse = (response) => {
  if (!response.credential) {
    alert("No Google credential received");
    return;
  }
  const user = jwtDecode(response.credential);
  console.log("Google JWT User:", user);
  localStorage.setItem("googleRegister", JSON.stringify({
    googleIdToken: response.credential,
    name: user.name,
    email: user.email,
    picture: user.picture,
  }));
  window.location.href = "/additional-info";
};


  return (
<div className="google-register-box">
  <h2>Register with Google</h2>
  <div id="google-register-button"></div>
</div>

  );
}

export default GoogleRegister;

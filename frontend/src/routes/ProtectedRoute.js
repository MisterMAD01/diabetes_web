// src/routes/ProtectedRoute.js
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

const ProtectedRoute = ({ children }) => {
  const { user, loadingUser } = useContext(UserContext);

  if (loadingUser) return null; // หรือ <Spinner /> หากต้องการ

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

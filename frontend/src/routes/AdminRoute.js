// src/routes/AdminRoute.js
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

const AdminRoute = ({ children }) => {
  const { user, loadingUser, isAdmin } = useContext(UserContext);

  if (loadingUser) return null; // หรือ Loading spinner

  if (!user || !isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default AdminRoute;

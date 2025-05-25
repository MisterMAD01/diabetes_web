import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

// 📌 หน้า public (ไม่ต้อง login)
import WelcomePage from "../pages/Welcome/WelcomePage";
import Register from "../pages/Login/Register/Register";
import Register1 from "../pages/Login/Register/AdditionalInfo";
import Login from "../pages/Login/Login/Login";
import CVDRiskCalculator from "../components/CVDRiskCalculator/CVDRiskCalculator";

// 🔐 หน้า private (ต้อง login)
import HomePage from "../pages/Home/homepage";
import Appointment from "../pages/Appointment/AppointmentPage";
import Report from "../pages/Report/ReportPage";
import Export from "../pages/Export/Exportpage";
import Patients from "../pages/Patients/Patient/Patient";
import UserProfile from "../pages/UserProfile/UserProfile";

// 🔒 หน้าเฉพาะ admin
import ManageAccounts from "../pages/Admin/ManageAccounts";
import Datamanagement from "../pages/Admin/Datamanagement"

const AppRoutes = () => (
  <Routes>

    {/* 🔓 Public Routes */}
    <Route path="/" element={<WelcomePage />} />
    <Route path="/register" element={<Register />} />
    <Route path="/login" element={<Login />} />
    <Route path="/additional-info" element={<Register1 />} />
    <Route path="/cvs" element={<CVDRiskCalculator />} />

    {/* 🔐 Protected Routes (Login Required) */}
    <Route path="/home" element={
      <ProtectedRoute><HomePage /></ProtectedRoute>
    } />
    <Route path="/appointments" element={
      <ProtectedRoute><Appointment /></ProtectedRoute>
    } />
    <Route path="/reports" element={
      <ProtectedRoute><Report /></ProtectedRoute>
    } />
    <Route path="/export" element={
      <ProtectedRoute><Export /></ProtectedRoute>
    } />
    <Route path="/patients" element={
      <ProtectedRoute><Patients /></ProtectedRoute>
    } />
    <Route path="/user/profile" element={
      <ProtectedRoute><UserProfile /></ProtectedRoute>
    } />

    {/* 🔒 Admin Only */}
    <Route path="/manage-users" element={
      <AdminRoute><ManageAccounts /></AdminRoute>
    } />
    <Route path="/data-management" element={
      <AdminRoute><Datamanagement /></AdminRoute>
    } />
  </Routes>
);

export default AppRoutes;

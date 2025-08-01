import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AppointmentFormModal from "./AppointmentFormModal";
import AppointmentDetailModal from "./AppointmentDetailModal";
import AppointmentTable from "./AppointmentTable";
import AddDoctor from "../../components/AddDoctor/AddDoctor";
import "./AppointmentPage.css";
import { getLocalISODate } from "../../components/utils";
import ManageDoctorModal from "./ManageDoctorModal";
import "./ComfirmDelete.css";

const API_URL = process.env.REACT_APP_API;

const AppointmentPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [filterMode, setFilterMode] = useState("today");
  const [showModal, setShowModal] = useState(false);
  const [editAppointment, setEditAppointment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [showManageDoctorModal, setShowManageDoctorModal] = useState(false);

  const today = getLocalISODate(new Date());

  // ✅ แปลงวันที่จากฐานข้อมูลให้เหมาะกับ input type="date"
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().split("T")[0];
  };

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/doctors`);
      setDoctors(res.data);
    } catch (err) {
      console.error("โหลดรายชื่อแพทย์ล้มเหลว:", err);
      toast.error("โหลดรายชื่อแพทย์ล้มเหลว");
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/appointments`);
      setAppointments(res.data);
    } catch (err) {
      console.error("โหลดนัดหมายล้มเหลว:", err);
      toast.error("โหลดนัดหมายล้มเหลว");
    }
  };

  const toLocalISODate = getLocalISODate;

  const filtered = appointments.filter((appt) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      appt.Patient_Name?.toLowerCase().includes(search) ||
      appt.Patient_ID?.toString().includes(search);

    const appointmentDate = toLocalISODate(appt.Appointment_Date);

    const matchesDate =
      filterMode === "today"
        ? appointmentDate === today
        : filterMode === "date"
        ? appointmentDate === selectedDate
        : true;

    const matchesDoctor =
      selectedDoctor === "" || String(appt.Doctor_ID) === selectedDoctor;

    return matchesSearch && matchesDate && matchesDoctor;
  });

  const confirmDelete = (appt) => {
    setAppointmentToDelete(appt);
    setShowConfirmModal(true);
  };

  const handleConfirmedDelete = async () => {
    try {
      await axios.delete(
        `${API_URL}/api/appointments/${appointmentToDelete.Appointment_ID}`
      );
      toast.success("ลบนัดหมายเรียบร้อย");
      setShowConfirmModal(false);
      fetchAppointments();
    } catch (err) {
      console.error("ลบล้มเหลว:", err);
      toast.error("เกิดข้อผิดพลาดในการลบนัดหมาย");
    }
  };

  const handleView = (appt) => {
    setSelectedAppointment({
      id: appt.Appointment_ID,
      hn: appt.Patient_ID,
      name: appt.Patient_Name,
      date: formatDateForInput(appt.Appointment_Date),
      time: appt.Appointment_Time?.slice(0, 5),
      note: appt.Reason,
      status: appt.Status,
      doctor: appt.Doctor_Name,
      Doctor_ID: appt.Doctor_ID,
    });
    setShowDetailModal(true);
  };

  const handleEdit = (index) => {
    const appt = appointments[index];
    setEditAppointment({
      id: appt.Appointment_ID,
      hn: appt.Patient_ID,
      name: appt.Patient_Name,
      date: formatDateForInput(appt.Appointment_Date), // ✅ แปลงตรงนี้
      time: appt.Appointment_Time?.slice(0, 5),
      note: appt.Reason,
      status: appt.Status,
      Doctor_ID: appt.Doctor_ID,
    });
    setShowModal(true);
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await axios.patch(`${API_URL}/api/appointments/status`, {
        Appointment_ID: appointmentId,
        Status: newStatus,
      });
      toast.success("อัปเดตสถานะเรียบร้อย");
      setShowDetailModal(false);
      fetchAppointments();
    } catch (error) {
      console.error("อัปเดตสถานะล้มเหลว:", error);
      toast.error("อัปเดตสถานะล้มเหลว");
    }
  };

  return (
    <div className="appointment-page">
      <h2 className="appointment-title">การนัดหมาย</h2>

      <div className="header-row">
        <input
          type="text"
          placeholder="ค้นหา"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="button-group">
          <button
            className="add-btn1"
            onClick={() => {
              setEditAppointment(null);
              setShowModal(true);
            }}
          >
            + เพิ่มการนัดหมาย
          </button>
          <button className="add-btn2" onClick={() => setShowDoctorModal(true)}>
            + เพิ่มแพทย์
          </button>
          <button
            className="add-btn2"
            onClick={() => setShowManageDoctorModal(true)}
          >
            จัดการแพทย์
          </button>
        </div>
      </div>

      <div className="filter-row">
        <div className="filter-toggle">
          <button
            className={filterMode === "today" ? "active" : ""}
            onClick={() => setFilterMode("today")}
          >
            นัดหมายวันนี้
          </button>
          <button
            className={filterMode === "all" ? "active" : ""}
            onClick={() => setFilterMode("all")}
          >
            ทั้งหมด
          </button>
        </div>
        <div className="date-doctor-dropdown">
          <div className="date-picker">
            <label>เลือกวันที่:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setFilterMode("date");
                setSelectedDate(e.target.value);
              }}
            />
          </div>
          <div className="doctor-filter">
            <label>แพทย์ผู้ดูแล:</label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
            >
              <option value="">ทั้งหมด</option>
              {doctors.map((doc) => (
                <option key={doc.Doctor_ID} value={doc.Doctor_ID}>
                  {doc.D_Name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <AppointmentTable
        appointments={filtered}
        allAppointments={appointments}
        onEdit={handleEdit}
        onDelete={confirmDelete}
        onView={handleView}
      />
      {showManageDoctorModal && (
        <ManageDoctorModal
          doctors={doctors}
          onClose={() => setShowManageDoctorModal(false)}
          onRefresh={fetchDoctors}
        />
      )}

      {showModal && (
        <AppointmentFormModal
          onClose={() => {
            setShowModal(false);
            setEditAppointment(null);
            fetchAppointments();
          }}
          editAppointment={editAppointment}
        />
      )}

      {showDetailModal && selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          onClose={() => setShowDetailModal(false)}
          onStatusChange={handleStatusChange}
          onEdit={(appt) => {
            setEditAppointment(appt);
            setShowDetailModal(false);
            setShowModal(true);
          }}
        />
      )}

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal small">
            <div className="modal-icon warning">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3>ยืนยันการลบนัดหมาย</h3>
            <p>
              คุณแน่ใจหรือไม่ว่าต้องการลบนัดหมายนี้?
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="modal-actions">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="cancel-btn"
              >
                ยกเลิก
              </button>
              <button onClick={handleConfirmedDelete} className="delete-btn">
                ลบนัดหมาย
              </button>
            </div>
          </div>
        </div>
      )}

      {showDoctorModal && (
        <AddDoctor onClose={() => setShowDoctorModal(false)} />
      )}
    </div>
  );
};

export default AppointmentPage;

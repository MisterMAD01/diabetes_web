import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AppointmentFormModal from "./AppointmentFormModal";
import AppointmentDetailModal from "./AppointmentDetailModal";
import AppointmentTable from "./AppointmentTable";
import AddDoctor from "../../components/AddDoctor/AddDoctor";
import ManageDoctorModal from "./ManageDoctorModal";
import { getLocalISODate } from "../../components/utils";
import "./AppointmentPage.css";
import "./ComfirmDelete.css";

const API_URL = process.env.REACT_APP_API;
const itemsPerPage = 9;

const AppointmentPage = () => {
  // States
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState("today");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [editAppointment, setEditAppointment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showManageDoctorModal, setShowManageDoctorModal] = useState(false);

  const today = getLocalISODate(new Date());

  // Fetch functions
  const fetchAppointments = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/appointments`);
      setAppointments(data);
    } catch (error) {
      toast.error("โหลดนัดหมายล้มเหลว");
      console.error(error);
    }
  }, []);

  const fetchDoctors = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/doctors`);
      setDoctors(data);
    } catch (error) {
      toast.error("โหลดรายชื่อแพทย์ล้มเหลว");
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, [fetchAppointments, fetchDoctors]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterMode, selectedDate, selectedDoctor]);

  // Filtered data
  const filteredAppointments = appointments.filter((appt) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      appt.Patient_Name?.toLowerCase().includes(search) ||
      appt.Citizen_ID?.toLowerCase().includes(search);

    const appointmentDate = getLocalISODate(appt.Appointment_Date);

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

  // Pagination calculations
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAppointments = filteredAppointments.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // ฟังก์ชันสร้าง range หน้า pagination ตามที่ขอ (เช่น 123..10, 456..10)
  const getPaginationRange = () => {
    const total = totalPages;
    const current = currentPage;
    const range = [];

    if (total <= 5) {
      // ถ้าน้อยกว่าหรือเท่ากับ 5 หน้า แสดงทุกหน้าเลย
      for (let i = 1; i <= total; i++) range.push(i);
    } else {
      if (current <= 3) {
        // หน้าแรก ๆ แสดง 1 2 3 ... last
        range.push(1, 2, 3, "...", total);
      } else if (current >= total - 2) {
        // หน้าสุดท้าย แสดง first ... last-2 last-1 last
        range.push(1, "...", total - 2, total - 1, total);
      } else {
        // กลาง ๆ แสดง first ... current-1 current current+1 ... last
        range.push(1, "...", current - 1, current, current + 1, "...", total);
      }
    }

    return range;
  };

  // Handlers
  const openAddAppointment = () => {
    setEditAppointment(null);
    setShowAppointmentModal(true);
  };

  const openEditAppointment = (appt) => {
    setEditAppointment({
      id: appt.Appointment_ID,
      hn: appt.Patient_ID,
      name: appt.Patient_Name,
      date: formatDateForInput(appt.Appointment_Date),
      time: appt.Appointment_Time?.slice(0, 5),
      note: appt.Reason,
      status: appt.Status,
      Doctor_ID: appt.Doctor_ID,
    });
    setShowAppointmentModal(true);
  };

  const openViewAppointment = (appt) => {
    setSelectedAppointment({
      id: appt.Appointment_ID,
      hn: appt.Patient_ID,
      Citizen: appt.Citizen_ID,
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

  const confirmDelete = (appt) => {
    setAppointmentToDelete(appt);
    setShowConfirmModal(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      await axios.delete(
        `${API_URL}/api/appointments/${appointmentToDelete.Appointment_ID}`
      );
      toast.success("ลบนัดหมายเรียบร้อย");
      setShowConfirmModal(false);
      fetchAppointments();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการลบนัดหมาย");
      console.error(error);
    }
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
      toast.error("อัปเดตสถานะล้มเหลว");
      console.error(error);
    }
  };

  // Helper: แปลงวันที่สำหรับ input date
  function formatDateForInput(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().split("T")[0];
  }

  return (
    <div className="appointment-page">
      <h2 className="appointment-title">การนัดหมาย</h2>

      <div className="header-row">
        <input
          type="text"
          placeholder="ค้นหา"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // รีเซ็ตหน้าเมื่อค้นหาใหม่
          }}
        />
        <div className="button-group">
          <button className="add-btn1" onClick={openAddAppointment}>
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
            <label>แพทย์ผู้ดูแล:</label>
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
        appointments={currentAppointments}
        onEdit={openEditAppointment}
        onDelete={confirmDelete}
        onView={openViewAppointment}
      />

      {/* Updated Pagination - Same as AllPatients */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            className="page-btn"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ก่อนหน้า
          </button>

          {getPaginationRange().map((page, idx) =>
            page === "..." ? (
              <span key={idx} className="dots">
                ...
              </span>
            ) : (
              <button
                key={idx}
                className={`page-btn ${currentPage === page ? "active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            )
          )}

          <button
            className="page-btn"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            ถัดไป
          </button>
        </div>
      )}

      {showAppointmentModal && (
        <AppointmentFormModal
          onClose={() => {
            setShowAppointmentModal(false);
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
            setShowAppointmentModal(true);
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
              <button onClick={handleDeleteConfirmed} className="delete-btn">
                ลบนัดหมาย
              </button>
            </div>
          </div>
        </div>
      )}

      {showDoctorModal && (
        <AddDoctor onClose={() => setShowDoctorModal(false)} />
      )}

      {showManageDoctorModal && (
        <ManageDoctorModal
          doctors={doctors}
          onClose={() => setShowManageDoctorModal(false)}
          onRefresh={fetchDoctors}
        />
      )}
    </div>
  );
};

export default AppointmentPage;

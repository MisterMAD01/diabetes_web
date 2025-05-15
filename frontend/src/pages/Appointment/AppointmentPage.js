import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AppointmentFormModal from './AppointmentFormModal';
import AppointmentDetailModal from './AppointmentDetailModal';
import AppointmentTable from './AppointmentTable';
import './AppointmentPage.css';
import { getLocalISODate } from '../../components/utils';

const API_URL = process.env.REACT_APP_API; // ✅ ใช้ค่าจาก .env

const AppointmentPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [filterMode, setFilterMode] = useState('today');
  const [showModal, setShowModal] = useState(false);
  const [editAppointment, setEditAppointment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  const today = getLocalISODate(new Date());

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/appointments`);
      setAppointments(res.data);
    } catch (err) {
      console.error('โหลดนัดหมายล้มเหลว:', err);
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
      filterMode === 'today'
        ? appointmentDate === today
        : filterMode === 'date'
        ? appointmentDate === selectedDate
        : true;

    return matchesSearch && matchesDate;
  });

  const confirmDelete = (appt) => {
    setAppointmentToDelete(appt);
    setShowConfirmModal(true);
  };

  const handleConfirmedDelete = async () => {
    try {
      await axios.delete(`${API_URL}/api/appointments/${appointmentToDelete.Appointment_ID}`);
      setShowConfirmModal(false);
      fetchAppointments();
    } catch (err) {
      console.error('ลบล้มเหลว:', err);
      alert('เกิดข้อผิดพลาด');
    }
  };

  const handleView = (appt) => {
    setSelectedAppointment({
      id: appt.Appointment_ID,
      hn: appt.Patient_ID,
      name: appt.Patient_Name,
      date: appt.Appointment_Date,
      time: appt.Appointment_Time?.slice(0, 5),
      note: appt.Reason,
      status: appt.Status,
    });
    setShowDetailModal(true);
  };

  const handleEdit = (index) => {
    const appt = appointments[index];
    setEditAppointment({
      id: appt.Appointment_ID,
      hn: appt.Patient_ID,
      name: appt.Patient_Name,
      date: appt.Appointment_Date?.split('T')[0],
      time: appt.Appointment_Time?.slice(0, 5),
      note: appt.Reason,
      status: appt.Status,
    });
    setShowModal(true);
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await axios.patch(`${API_URL}/api/appointments/status`, {
        Appointment_ID: appointmentId,
        Status: newStatus,
      });
      alert('อัปเดตสถานะเรียบร้อย');
      setShowDetailModal(false);
      fetchAppointments();
    } catch (error) {
      console.error('อัปเดตสถานะล้มเหลว:', error);
    }
  };

  return (
    <div className="appointment-page">
      <h2>การนัดหมาย</h2>

      <div className="header-row">
        <input
          type="text"
          placeholder="ค้นหา"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          className="add-btn"
          onClick={() => {
            setEditAppointment(null);
            setShowModal(true);
          }}
        >
          + เพิ่มการนัดหมาย
        </button>
      </div>

      <div className="filter-row">
        <div className="filter-toggle">
          <button
            className={filterMode === 'today' ? 'active' : ''}
            onClick={() => setFilterMode('today')}
          >
            นัดหมายวันนี้
          </button>
          <button
            className={filterMode === 'all' ? 'active' : ''}
            onClick={() => setFilterMode('all')}
          >
            ทั้งหมด
          </button>
        </div>
        <div className="date-picker">
          <label>เลือกวันที่:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setFilterMode('date');
              setSelectedDate(e.target.value);
            }}
          />
        </div>
      </div>

      <AppointmentTable
        appointments={filtered}
        allAppointments={appointments}
        onEdit={handleEdit}
        onDelete={confirmDelete}
        onView={handleView}
      />

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
            <p>คุณแน่ใจหรือไม่ว่าต้องการลบนัดหมายนี้? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
            <div className="modal-actions">
              <button onClick={() => setShowConfirmModal(false)} className="cancel-btn">ยกเลิก</button>
              <button onClick={handleConfirmedDelete} className="delete-btn">ลบนัดหมาย</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentPage;

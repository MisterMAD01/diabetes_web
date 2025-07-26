import React, { useEffect, useState } from "react";
import Select from "react-select";
import axios from "axios";
import { toast } from "react-toastify";
import "./AppointmentFormModal.css";

const API_URL = process.env.REACT_APP_API;

const getTodayDateString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const PatientSelect = ({ patients, selectedPatient, onChange, isDisabled }) => (
  <div>
    <label>ชื่อผู้ป่วย</label>
    <Select
      options={patients}
      value={selectedPatient}
      onChange={onChange}
      placeholder="ค้นหาชื่อผู้ป่วย..."
      isSearchable={!isDisabled}
      components={{ DropdownIndicator: isDisabled ? null : undefined }}
      isDisabled={isDisabled} // ปิดไม่ให้แก้ไข
    />
  </div>
);

const DoctorSelect = ({ doctors, selectedDoctor, onChange }) => (
  <div>
    <label>เลือกแพทย์</label>
    <Select
      options={doctors}
      value={selectedDoctor}
      onChange={onChange}
      placeholder="ค้นหาแพทย์..."
      isSearchable
    />
  </div>
);

const DateInput = ({ defaultValue, min }) => (
  <div>
    <label>วันที่</label>
    <input
      name="date"
      type="date"
      required
      min={min}
      defaultValue={defaultValue}
    />
  </div>
);

const TimeInput = ({ defaultValue }) => (
  <div>
    <label>เวลา</label>
    <input name="time" type="time" required defaultValue={defaultValue || ""} />
  </div>
);

const HnField = ({ hn }) => (
  <div>
    <label>รหัสผู้ป่วย (HN)</label>
    <input type="text" name="hn" value={hn} disabled />
  </div>
);

const NoteTextarea = ({ defaultValue }) => (
  <div className="appt-full-width">
    <label>หมายเหตุ</label>
    <textarea name="note" rows="2" defaultValue={defaultValue || ""} />
  </div>
);

const AppointmentFormModal = ({ onClose, editAppointment }) => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [hn, setHn] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const todayString = getTodayDateString();

  useEffect(() => {
    axios
      .get(`${API_URL}/api/appointments/patients`)
      .then((res) => {
        const options = res.data.map((p) => ({
          value: p.Patient_ID,
          label: p.P_Name,
        }));
        setPatients(options);

        if (editAppointment) {
          const match = options.find((opt) => opt.value === editAppointment.hn);
          setSelectedPatient(match || null);
          setHn(editAppointment.hn);
        }
      })
      .catch((err) => console.error("โหลดรายชื่อผู้ป่วยล้มเหลว:", err));
  }, [editAppointment]);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/doctors`)
      .then((res) => {
        const options = res.data.map((d) => ({
          value: d.Doctor_ID,
          label: `${d.D_Name} (${d.specialty})`,
        }));
        setDoctors(options);

        if (editAppointment) {
          const match = options.find(
            (opt) => opt.value === editAppointment.Doctor_ID
          );
          setSelectedDoctor(match || null);
        }
      })
      .catch((err) => console.error("โหลดรายชื่อหมอล้มเหลว:", err));
  }, [editAppointment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    const payload = {
      Patient_ID: hn,
      Appointment_Date: form.date.value,
      Appointment_Time: form.time.value,
      Reason: form.note.value,
      Doctor_ID: selectedDoctor?.value,
      Status: "รอพบแพทย์",
    };

    try {
      if (editAppointment) {
        await axios.put(`${API_URL}/api/appointments`, {
          ...payload,
          Appointment_ID: editAppointment.id,
        });
        toast.success("แก้ไขนัดหมายสำเร็จ");
      } else {
        await axios.post(`${API_URL}/api/appointments`, payload);
        toast.success("เพิ่มนัดหมายสำเร็จ");
      }

      onClose();
      form.reset();
      setSelectedPatient(null);
      setSelectedDoctor(null);
      setHn("");
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
      toast.error("ไม่สามารถบันทึกนัดหมายได้");
    }
  };

  const handlePatientChange = (selected) => {
    setSelectedPatient(selected);
    setHn(selected?.value || "");
  };

  return (
    <div className="appt-modal-overlay">
      <div className="appt-modal appt-modal-large">
        <div className="appt-modal-header">
          <h3>{editAppointment ? "แก้ไขนัดหมาย" : "สร้างนัดหมายใหม่"}</h3>
          <button className="appt-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="appt-modal-form">
          <div className="appt-modal-grid">
            <PatientSelect
              patients={patients}
              selectedPatient={selectedPatient}
              onChange={handlePatientChange}
              isDisabled={!!editAppointment} // Disable ถ้าแก้ไข
            />
            <HnField hn={hn} />
            <DateInput defaultValue={editAppointment?.date} min={todayString} />
            <DoctorSelect
              doctors={doctors}
              selectedDoctor={selectedDoctor}
              onChange={setSelectedDoctor}
            />

            <TimeInput defaultValue={editAppointment?.time} />
            <NoteTextarea defaultValue={editAppointment?.note} />
          </div>
          <div className="appt-modal-actions">
            <button type="submit" className="appt-submit-btn">
              {editAppointment ? "บันทึกการแก้ไข" : "บันทึกนัดหมาย"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentFormModal;

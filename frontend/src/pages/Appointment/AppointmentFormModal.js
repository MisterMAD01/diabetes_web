import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API; // 🔧 ดึง API URL จาก .env

const AppointmentFormModal = ({ onClose, editAppointment }) => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [hn, setHn] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/appointments/patients`)
      .then(res => {
        const options = res.data.map(p => ({
          value: p.Patient_ID,
          label: p.P_Name,
        }));
        setPatients(options);

        if (editAppointment) {
          const match = options.find(opt => opt.value === editAppointment.hn);
          setSelectedPatient(match || null);
          setHn(editAppointment.hn);
        }
      })
      .catch(err => console.error('โหลดรายชื่อผู้ป่วยล้มเหลว:', err));
  }, [editAppointment]);

  useEffect(() => {
  axios.get(`${API_URL}/api/doctors`)
    .then(res => {
      const options = res.data.map(d => ({
        value: d.Doctor_ID,
        label: `${d.D_Name} (${d.specialty})`,
      }));
      setDoctors(options);

      if (editAppointment) {
        const match = options.find(opt => opt.value === editAppointment.Doctor_ID);
        setSelectedDoctor(match || null);
      }
    })
    .catch(err => console.error('โหลดรายชื่อหมอล้มเหลว:', err));
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
      Status: 'รอพบแพทย์'
    };

    try {
      if (editAppointment) {
        await axios.put(`${API_URL}/api/appointments`, {
          ...payload,
          Appointment_ID: editAppointment.id,
        });
      } else {
        await axios.post(`${API_URL}/api/appointments`, payload);
      }

      onClose();
      form.reset();
    } catch (error) {
      console.error('เกิดข้อผิดพลาด:', error);
      alert('ไม่สามารถบันทึกนัดหมายได้');
    }
  };

  const handlePatientChange = (selected) => {
    setSelectedPatient(selected);
    setHn(selected.value);
  };

  return (
    <div className="modal-overlay">
      <div className="modal large">
        <div className="modal-header">
          <h3>{editAppointment ? 'แก้ไขนัดหมาย' : 'สร้างนัดหมายใหม่'}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-grid">
            <div>
              <label>ชื่อผู้ป่วย</label>
              <Select
                options={patients}
                value={selectedPatient}
                onChange={handlePatientChange}
                placeholder="ค้นหาชื่อผู้ป่วย..."
                isSearchable
                components={{ DropdownIndicator: null }}
                styles={{
                  container: (base) => ({ ...base, width: '100%' }),
                  control: (base, state) => ({
                    ...base,
                    minHeight: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: state.isFocused ? '0 0 0 1px #2684FF' : base.boxShadow,
                    borderColor: state.isFocused ? '#2684FF' : '#ccc',
                    '&:hover': { borderColor: '#2684FF' },
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    height: '38px',
                    padding: '0 8px',
                    display: 'flex',
                    alignItems: 'center',
                  }),
                  input: (base) => ({
                    ...base,
                    margin: 0,
                    padding: 0,
                  }),
                  indicatorsContainer: () => ({ display: 'none' }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />
            </div>
            <div>
              <label>รหัสผู้ป่วย (HN)</label>
              <input type="text" name="hn" value={hn} disabled />
            </div>
            <div>
  <label>เลือกแพทย์</label>
  <Select
    options={doctors}
    value={selectedDoctor}
    onChange={(selected) => setSelectedDoctor(selected)}
    placeholder="ค้นหาแพทย์..."
    isSearchable
  />
</div>

            <div>
              <label>วันที่</label>
              <input name="date" type="date" required defaultValue={editAppointment?.date} />
            </div>
            <div>
              <label>เวลา</label>
              <input
                name="time"
                type="time"
                required
                defaultValue={editAppointment?.time || ''}
              />
            </div>
            <div className="full-width">
              <label>หมายเหตุ</label>
              <textarea name="note" rows="2" defaultValue={editAppointment?.note || ''} />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">ยกเลิก</button>
            <button type="submit" className="submit-btn">
              {editAppointment ? 'บันทึกการแก้ไข' : 'บันทึกนัดหมาย'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentFormModal;

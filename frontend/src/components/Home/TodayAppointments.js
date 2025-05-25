import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TodayAppointments.css';
import { getLocalISODate } from '../utils'; // ปรับ path ตามจริงของคุณ

const TodayAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/appointments');

        const today = getLocalISODate(new Date()); // วันที่ปัจจุบัน (เขตเวลาไทย)

        const todayAppointments = res.data.filter((apt) => {
          const aptDate = getLocalISODate(apt.Appointment_Date);
          return aptDate === today;
        });

        setAppointments(todayAppointments);
      } catch (err) {
        console.error('โหลดนัดหมายล้มเหลว:', err);
      }
    };

    fetchAppointments();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case 'รอพบแพทย์':
        return 'status-waiting';
      case 'เสร็จสิ้น':
        return 'status-attended';
      case 'ยกเลิก':
        return 'status-cancel';
      default:
        return 'status-pending';
    }
  };

  return (
    <div className="appointment-card">
      <div className="appointment-header">
        <h3 className="title">การนัดหมายวันนี้</h3>
        <button className="view-all" onClick={() => navigate('/appointments')}>
          ดูทั้งหมด
        </button>
      </div>
      <div className="appointment-body">
        <table className="appointment-table">
          <thead>
            <tr>
              <th>ชื่อ-นามสกุล</th>
              <th>เวลา</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length > 0 ? (
              appointments.map((apt, index) => (
                <tr key={index}>
                  <td>
                    <div className="person-info">
                      <div className="avatar bg-blue">
                        {apt.Patient_Name?.charAt(0)}
                      </div>
                      <div>
                        <div className="name">{apt.Patient_Name}</div>
                        <div className="hn">HN: {apt.Patient_ID}</div>
                      </div>
                    </div>
                  </td>
                  <td>{apt.Appointment_Time?.slice(0, 5)} น.</td>
                  <td>
                    <span className={`status ${getStatusClass(apt.Status)}`}>
                      {apt.Status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center' }}>
                  ไม่มีนัดหมายวันนี้
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TodayAppointments;

import React from 'react';
import DashboardOverview from '../../components/Home/DashboardOverview';
import RiskGroupCard from '../../components/Home/RiskGroupCard';
import TodayAppointments from '../../components/Home/TodayAppointments';
import './homepage.css';


const HomePage = () => {
  return (
    <div className="home-page">

      {/* ✅ แถวที่ 1: 3 Box Dashboard */}
      <div className="dashboard-overview-row">
        <DashboardOverview />
      </div>

      {/* ✅ แถวที่ 2: 2 Box Risk + Appointments */}
      <div className="grid-two-boxes">
        <RiskGroupCard />
        <TodayAppointments />
      </div>
    </div>
  );
};

export default HomePage;

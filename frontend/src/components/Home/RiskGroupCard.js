import React from 'react';
import './RiskGroupCard.css';

const RiskGroupCard = () => {
  return (
    <div className="risk-card">
      <div className="risk-card-header">
        <h3>กลุ่มความเสี่ยง (ปิงปองจราจร 7 สี)</h3>
        <button className="see-all-btn">ดูทั้งหมด</button>
      </div>

      <div className="risk-list">
        <div className="risk-item">
          <div className="dot ping-pong-green"></div>
          <span className="label">กลุ่มปกติ</span>
          <span className="count">86 คน</span>
        </div>
        <div className="risk-item">
          <div className="dot ping-pong-yellow"></div>
          <span className="label">กลุ่มเสี่ยง</span>
          <span className="count">52 คน</span>
        </div>
        <div className="risk-item">
          <div className="dot ping-pong-orange"></div>
          <span className="label">กลุ่มเสี่ยงสูง</span>
          <span className="count">42 คน</span>
        </div>
        <div className="risk-item">
          <div className="dot ping-pong-red"></div>
          <span className="label">กลุ่มป่วย</span>
          <span className="count">38 คน</span>
        </div>
        <div className="risk-item">
          <div className="dot ping-pong-red-dark"></div>
          <span className="label">กลุ่มป่วยที่ควบคุมไม่ได้</span>
          <span className="count">18 คน</span>
        </div>
        <div className="risk-item">
          <div className="dot ping-pong-black"></div>
          <span className="label">กลุ่มป่วยที่มีภาวะแทรกซ้อน</span>
          <span className="count">8 คน</span>
        </div>
        <div className="risk-item">
          <div className="dot ping-pong-white"></div>
          <span className="label">กลุ่มป่วยที่มีภาวะแทรกซ้อนรุนแรง</span>
          <span className="count">4 คน</span>
        </div>
      </div>

      <div className="risk-chart">
        <canvas id="riskChart" height="200"></canvas>
      </div>
    </div>
  );
};

export default RiskGroupCard;

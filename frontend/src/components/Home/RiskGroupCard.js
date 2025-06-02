import React, { useEffect, useState } from 'react';
import './RiskGroupCard.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const colorLabels = {
  'สีขาว': 'กลุ่มปกติ',
  'สีเขียวอ่อน': 'กลุ่มผู้ป่วยที่มีความเสี่ยงน้อย',
  'สีเขียว': 'กลุ่มผู้ป่วยที่มีความเสี่ยงปานกลาง',
  'สีเหลือง': 'กลุ่มผู้ป่วยที่เริ่มมีภาวะเสี่ยง',
  'สีส้ม': 'กลุ่มผู้ป่วยที่มีความเสี่ยงสูง',
  'สีแดง': 'กลุ่มผู้ป่วยที่มีอาการชัดเจน',
  'สีดำ': 'กลุ่มผู้ป่วยที่มีภาวะแทรกซ้อนรุนแรง'
};

const colorClasses = {
  'สีขาว': 'ping-pong-white',
  'สีเขียวอ่อน': 'ping-pong-light-green',
  'สีเขียว': 'ping-pong-green',
  'สีเหลือง': 'ping-pong-yellow',
  'สีส้ม': 'ping-pong-orange',
  'สีแดง': 'ping-pong-red',
  'สีดำ': 'ping-pong-black',

};

const RiskGroupCard = () => {
  const [riskCounts, setRiskCounts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API}/api/risk/counts`)
      .then(res => setRiskCounts(res.data))
      .catch(err => console.error('❌ โหลด risk-counts ล้มเหลว:', err));
  }, []);

  return (
    <div className="risk-card">
      <div className="risk-card-header">
        <h3>กลุ่มความเสี่ยง (ปิงปองจราจร 7 สี)</h3>
        <button className="see-all-btn" onClick={() => navigate('/Risk-Group')}>
          ดูทั้งหมด
        </button>
      </div>

      <div className="risk-list">
        {Object.keys(colorLabels).map((color) => {
          const count = riskCounts.find(item => item.color === color)?.count || 0;
          return (
            <div className="risk-item" key={color}>
              <div className={`dot ${colorClasses[color]}`}></div>
              <span className="label">{colorLabels[color]}</span>
              <span className="count">{count} คน</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RiskGroupCard;

// src/components/Report/SummaryMetricCard.jsx

import React from "react";
import { FaTint, FaHeartbeat, FaWeight, FaRulerVertical } from "react-icons/fa";
import "./SummaryMetricCard.css";

// แมป metricKey ไปหาไอคอน
const iconMap = {
  sugar: <FaTint />,
  pressure: <FaHeartbeat />,
  weight: <FaWeight />,
  waist: <FaRulerVertical />,
};

const SummaryMetricCard = ({ metricKey, title, value, unit, prevValue }) => {
  // คำนวณเปอร์เซ็นต์การเปลี่ยนแปลง
  const change =
    prevValue != null && prevValue !== 0
      ? ((value - prevValue) / prevValue) * 100
      : 0;
  const formattedChange = (change >= 0 ? "+" : "") + change.toFixed(1) + "%";

  return (
    <div className="summary-card">
      <div className="summary-header">
        <div className="summary-icon">{iconMap[metricKey] || null}</div>
        <div className="summary-text">
          <div className="summary-title">{title}</div>
          <div className="summary-value">
            {value} <span className="unit">{unit}</span>
          </div>
        </div>
      </div>
      <div className={"summary-trend " + (change >= 0 ? "up" : "down")}>
        {formattedChange} จากก่อนหน้า
      </div>
    </div>
  );
};

export default SummaryMetricCard;

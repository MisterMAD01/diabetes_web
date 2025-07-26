import React from "react";
import { FaTint, FaHeartbeat, FaWeight, FaRulerVertical } from "react-icons/fa";
import "./SummaryMetricCard.css";

const iconMap = {
  sugar: <FaTint />,
  pressure: <FaHeartbeat />,
  weight: <FaWeight />,
  waist: <FaRulerVertical />,
};

const parsePressure = (str) => {
  if (!str || typeof str !== "string") return null; // เช็คก่อน
  const [sys, dia] = str.split("/").map(Number);
  return !isNaN(sys) && !isNaN(dia) && dia !== 0 ? sys / dia : null;
};

const SummaryMetricCard = ({ metricKey, title, value, unit, prevValue }) => {
  let current = value;
  let previous = prevValue;

  // หากเป็นความดัน ต้องแปลงจาก "120/80" เป็นอัตราส่วน
  if (metricKey === "pressure") {
    current = parsePressure(value);
    previous = parsePressure(prevValue);
  }

  let change = null;
  if (
    current != null &&
    previous != null &&
    typeof current === "number" &&
    typeof previous === "number" &&
    !isNaN(current) &&
    !isNaN(previous) &&
    previous !== 0
  ) {
    change = ((current - previous) / previous) * 100;
  }

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

      {change !== null ? (
        <div className={`summary-trend ${change >= 0 ? "up" : "down"}`}>
          {(change >= 0 ? "+" : "") + change.toFixed(1)}% จากก่อนหน้า
        </div>
      ) : (
        <div className="summary-trend up">+0.0% จากก่อนหน้า</div>
      )}
    </div>
  );
};

export default SummaryMetricCard;

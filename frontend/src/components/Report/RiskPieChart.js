import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const RiskLegend = ({ color, label }) => (
  <div className="risk-legend-wrapper">
    <div className="risk-legend-circle" style={{ backgroundColor: color }}></div>
    <span className="risk-legend-text">{label}</span>
  </div>
);

const RiskPieChart = ({ data, riskPercent, riskColor }) => (
  <div className="info-right">
    <div className="risk-pie-row">
      <RiskLegend color={riskColor} label="กลุ่มความเสี่ยง" />
      <div className="pie-chart-box">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={40}
              outerRadius={70}
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={[riskColor, '#91d5ff'][index]} />
              ))}
            </Pie>
            <text
              x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
              fontSize={16} fontWeight="bold"
            >
              {riskPercent}%
            </text>
          </PieChart>
        </ResponsiveContainer>
        <div className="pie-label">โอกาสเกิดโรคแทรกซ้อน</div>
      </div>
    </div>
  </div>
);

export default RiskPieChart;

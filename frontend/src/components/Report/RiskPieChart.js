import React from "react";
import { PieChart, Pie, Cell } from "recharts";

const RiskPieChart = ({ data, riskPercent, riskColor }) => (
  <div className="info-right">
    <div className="risk-pie-row">
      {/* ลบ RiskLegend ตรงนี้ */}
      <div className="pie-chart-box">
        <PieChart width={140} height={140}>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={40}
            outerRadius={70}
            startAngle={90}
            endAngle={-270}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={[riskColor, "#91d5ff"][index]}
              />
            ))}
          </Pie>
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={16}
            fontWeight="bold"
          >
            {riskPercent}%
          </text>
        </PieChart>
        <div className="pie-label">โอกาสเกิดโรคแทรกซ้อน</div>
      </div>
    </div>
  </div>
);

export default RiskPieChart;

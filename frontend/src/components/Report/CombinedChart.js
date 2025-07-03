import React from "react";
import dayjs from "dayjs";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import "./CombinedChart.css";

const metricConfig = {
  sugar: { name: "น้ำตาล", unit: "mg/dL", color: "#4caf50", dataKey: "sugar" },
  systolic: {
    name: "ความดัน (บน)",
    unit: "mmHg",
    color: "#1890ff",
    dataKey: "systolic",
  },
  diastolic: {
    name: "ความดัน (ล่าง)",
    unit: "mmHg",
    color: "#13c2c2",
    dataKey: "diastolic",
  },
  weight: { name: "น้ำหนัก", unit: "kg", color: "#fa8c16", dataKey: "weight" },
  waist: { name: "รอบเอว", unit: "cm", color: "#f5222d", dataKey: "waist" },
};

const CombinedChart = ({ data }) => {
  const thisYear = dayjs().year();
  const yearData = data
    .filter((item) => dayjs(item.date).year() === thisYear)
    .sort((a, b) => (dayjs(a.date).isBefore(dayjs(b.date)) ? -1 : 1));

  const lines = Object.values(metricConfig);

  return (
    <div className="combined-chart-container">
      <div className="combined-chart-title">ภาพรวมแนวโน้มสุขภาพรายเดือน</div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={yearData}
          margin={{ top: 60, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(val) => dayjs(val).format("MMM")}
            interval={0}
          />
          <YAxis />
          <Tooltip
            labelFormatter={(val) => dayjs(val).format("DD MMMM YYYY")}
            formatter={(value, name, props) => {
              const cfg = Object.values(metricConfig).find(
                (m) => m.dataKey === props.dataKey
              );
              return [`${value} ${cfg.unit}`, cfg.name];
            }}
          />
          <Legend
            verticalAlign="top"
            wrapperStyle={{ top: 50, left: 0 }}
            height={36}
            formatter={(value) => {
              const cfg = Object.values(metricConfig).find(
                (m) => m.name === value || `${m.name} (${m.unit})` === value
              );
              return cfg ? `${cfg.name} (${cfg.unit})` : value;
            }}
          />
          {lines.map((m) => (
            <Line
              key={m.dataKey}
              type="monotone"
              dataKey={m.dataKey}
              name={m.name}
              stroke={m.color}
              dot={false}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CombinedChart;

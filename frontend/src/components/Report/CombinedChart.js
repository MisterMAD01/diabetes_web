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
  pressure: {
    name: "ความดันโลหิต",
    unit: "mmHg",
    colors: ["#1890ff", "#13c2c2"],
    dataKeys: ["pressure", "diastolic"],
  },
  weight: { name: "น้ำหนัก", unit: "kg", color: "#fa8c16", dataKey: "weight" },
  waist: { name: "รอบเอว", unit: "cm", color: "#f5222d", dataKey: "waist" },
};

const CombinedChart = ({ data }) => {
  const thisYear = dayjs().year();
  const yearData = data
    .filter((item) => dayjs(item.date).year() === thisYear)
    .sort((a, b) => (dayjs(a.date).isBefore(dayjs(b.date)) ? -1 : 1));

  return (
    <div className="combined-chart-container-marin">
      <div className="combined-chart-title-marin">
        ภาพรวมแนวโน้มสุขภาพรายเดือน
      </div>
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
              if (name === "systolic") {
                return [`${value} mmHg`, "ความดันโลหิตค่าบน"];
              }
              if (name === "diastolic") {
                return [`${value} mmHg`, "ความดันโลหิตค่าล่าง"];
              }
              const cfg = Object.values(metricConfig).find(
                (m) => m.dataKey === props.dataKey
              );
              return [`${value} ${cfg?.unit}`, cfg?.name];
            }}
          />

          <Legend
            verticalAlign="top"
            wrapperStyle={{ top: 50, left: 0 }}
            height={36}
            formatter={(value) => {
              if (value === "systolic") return "ความดันโลหิตค่าบน";
              if (value === "diastolic") return "ความดันโลหิตค่าล่าง";
              const cfg = Object.values(metricConfig).find(
                (m) => m.name === value || `${m.name} (${m.unit})` === value
              );
              return cfg ? `${cfg.name} (${cfg.unit})` : value;
            }}
          />

          {/* วาดเส้นความดันโลหิต 2 เส้น */}
          <Line
            type="monotone"
            dataKey="systolic"
            name="systolic"
            stroke={metricConfig.pressure.colors[0]}
            dot={false}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="diastolic"
            name="diastolic"
            stroke={metricConfig.pressure.colors[1]}
            dot={false}
            strokeWidth={2}
          />

          {/* วาดเส้นอื่นๆ */}
          {Object.entries(metricConfig).map(([key, m]) => {
            if (key === "pressure") return null; // ความดันวาดแยกแล้ว
            return (
              <Line
                key={m.dataKey}
                type="monotone"
                dataKey={m.dataKey}
                name={m.name}
                stroke={m.color}
                dot={false}
                strokeWidth={2}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CombinedChart;

// src/components/Report/HealthChartGroup.jsx
import React from "react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts"; // ตัด Legend ออก
import "./HealthChartGroup.css";

// ตั้งค่า dayjs ให้รองรับ พ.ศ.
dayjs.extend(buddhistEra);
dayjs.locale("th");

const metricConfigs = {
  sugar: {
    title: "ระดับน้ำตาลในเลือด",
    key: "sugar",
    color: "#9966FF",
    unit: "mg/dL",
  },
  pressure: {
    title: "ความดันโลหิต",
    key: "systolic",
    color: "#FF6384",
    unit: "mmHg",
  },
  weight: { title: "น้ำหนัก", key: "weight", color: "#FF9F40", unit: "kg" },
  waist: { title: "รอบเอว", key: "waist", color: "#FFCD56", unit: "cm" },
};

const formatMonthTick = (val) => dayjs(val).format("MMM BBBB");
const formatYearTick = (val) => dayjs(val).format("BBBB");
const formatDateLabel = (label) => dayjs(label).format("D MMMM BBBB");

const HealthChartGroup = ({ data, selectedCharts, chartType, filterType }) => {
  const isYearly = filterType === "year";
  const intervalX = isYearly ? data.length - 1 : 0;

  const renderChart = ({ title, key, color, unit }) => (
    <ResponsiveContainer width="100%" height={220}>
      {chartType === "bar" ? (
        <BarChart
          data={data}
          margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={isYearly ? formatYearTick : formatMonthTick}
            interval={intervalX}
          />
          <YAxis />
          <Tooltip
            labelFormatter={formatDateLabel}
            formatter={(value) => `${value} ${unit}`}
          />
          <Bar dataKey={key} fill={color} />
        </BarChart>
      ) : chartType === "pie" ? (
        <PieChart margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <Tooltip formatter={(value) => `${value} ${unit}`} />
          <Pie
            data={data.map((item) => ({
              name: isYearly
                ? dayjs(item.date).format("BBBB")
                : dayjs(item.date).format("D MMM"),
              value: item[key],
            }))}
            dataKey="value"
            nameKey="name"
            outerRadius={80}
            label={({ name, value }) => `${name}: ${value} ${unit}`}
          >
            {data.map((_, idx) => (
              <Cell key={idx} fill={color} />
            ))}
          </Pie>
        </PieChart>
      ) : (
        <LineChart
          data={data}
          margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={isYearly ? formatYearTick : formatMonthTick}
            interval={intervalX}
          />
          <YAxis />
          <Tooltip
            labelFormatter={formatDateLabel}
            formatter={(value) => `${value} ${unit}`}
          />
          <Line
            type="monotone"
            dataKey={key}
            stroke={color}
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      )}
    </ResponsiveContainer>
  );

  return (
    <div className="health-charts">
      {selectedCharts.sugar && (
        <div className="chart-box">
          <h4>
            {metricConfigs.sugar.title} ({metricConfigs.sugar.unit})
          </h4>
          {renderChart(metricConfigs.sugar)}
        </div>
      )}
      {selectedCharts.pressure && (
        <div className="chart-box">
          <h4>
            {metricConfigs.pressure.title} ({metricConfigs.pressure.unit})
          </h4>
          {renderChart(metricConfigs.pressure)}
        </div>
      )}
      {selectedCharts.weight && (
        <div className="chart-box">
          <h4>
            {metricConfigs.weight.title} ({metricConfigs.weight.unit})
          </h4>
          {renderChart(metricConfigs.weight)}
        </div>
      )}
      {selectedCharts.waist && (
        <div className="chart-box">
          <h4>
            {metricConfigs.waist.title} ({metricConfigs.waist.unit})
          </h4>
          {renderChart(metricConfigs.waist)}
        </div>
      )}
    </div>
  );
};

export default HealthChartGroup;

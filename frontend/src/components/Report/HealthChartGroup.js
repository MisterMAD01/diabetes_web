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
} from "recharts";
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
    keys: ["systolic", "diastolic"], // ใช้ keys สำหรับหลายค่า
    colors: ["#FF6384", "#13c2c2"],
    unit: "mmHg",
  },
  weight: { title: "น้ำหนัก", key: "weight", color: "#FF9F40", unit: "kg" },
  waist: { title: "รอบเอว", key: "waist", color: "#FFCD56", unit: "cm" },
};

// Functions สำหรับการ Format วันที่
// ใช้ "HH:mm" เพื่อแสดงชั่วโมงและนาที
// BBBB สำหรับปี พ.ศ.
const formatMonthTick = (val) => dayjs(val).format("MMM BBBB"); // เช่น ม.ค. 2567
const formatYearTick = (val) => dayjs(val).format("BBBB"); // เช่น 2567
// ✅ เปลี่ยน formatDateLabel เพื่อรวมเวลา
const formatDateLabel = (label) => dayjs(label).format("D MMMM BBBB HH:mm"); // เช่น 1 มกราคม 2567 14:16

// ✅ เพิ่ม formatHourMinuteTick สำหรับ XAxis หากต้องการแสดงเวลาในบางโหมด
const formatDayTimeTick = (val) => dayjs(val).format("D MMM HH:mm"); // เช่น 10 ก.ค. 14:16

const HealthChartGroup = ({
  data, // data นี้คือ filteredData ที่ถูกกรองมาจาก ReportPage แล้ว
  selectedCharts,
  chartType,
  filterType, // ใช้ filterType เพื่อกำหนด tickFormatter
  selectedYear, // รับ selectedYear มาใช้ในการกำหนด intervalX
}) => {
  // ไม่ต้องกรองข้อมูลในนี้ซ้ำอีก เพราะ data ถูกกรองมาแล้ว
  const filteredData = data;

  // กำหนด interval สำหรับ XAxis เพื่อให้แสดงผลได้เหมาะสม
  // หากเป็นรายปี และมีข้อมูลน้อย อาจจะให้แสดงทุกจุด หรือเว้นตามความเหมาะสม
  // หากเป็นรายเดือน/กำหนดเอง อาจจะให้แสดงทุกจุด
  const isYearly = filterType === "year";
  const isMonthlyOrCustom = filterType === "month" || filterType === "custom";

  // ปรับ intervalX และ tickFormatter ตาม filterType
  let xAxisTickFormatter = formatMonthTick; // default for month
  let intervalX = 0; // default to show all ticks

  if (isYearly) {
    xAxisTickFormatter = formatYearTick;
    intervalX = filteredData.length > 10 ? "preserveEnd" : 0; // แสดงเฉพาะปลายหากข้อมูลเยอะ
  } else if (isMonthlyOrCustom) {
    xAxisTickFormatter = formatDayTimeTick; // แสดง วันที่และเวลา
    intervalX = 0; // แสดงทุกจุด (หากข้อมูลไม่เยอะเกินไป)
  }

  // ฟังก์ชัน renderChart เดียว เพื่อลดความซ้ำซ้อน
  const renderChart = ({ title, key, color, unit, keys, colors }) => {
    // ถ้ามีหลายค่า (เช่น ความดันโลหิต)
    if (Array.isArray(keys) && keys.length > 0) {
      if (chartType === "pie") {
        return <div>Pie chart ไม่รองรับสำหรับหลายค่า</div>;
      } else {
        const ChartComponent = chartType === "bar" ? BarChart : LineChart;
        const GraphElement = chartType === "bar" ? Bar : Line;
        return (
          <ResponsiveContainer width="100%" height={220}>
            <ChartComponent
              data={filteredData}
              margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={xAxisTickFormatter} // ✅ ใช้ xAxisTickFormatter
                interval={intervalX}
              />
              <YAxis />
              <Tooltip
                labelFormatter={formatDateLabel} // ✅ ใช้ formatDateLabel ที่แสดงเวลา
                formatter={(value) => `${value} ${unit}`}
              />
              {keys.map((k, idx) => (
                <GraphElement
                  key={k}
                  type="monotone" // ใช้ได้เฉพาะ LineChart
                  dataKey={k}
                  fill={chartType === "bar" ? colors[idx] : undefined} // Bar ใช้ fill
                  stroke={chartType === "line" ? colors[idx] : undefined} // Line ใช้ stroke
                  dot={chartType === "line" ? false : undefined} // Line ไม่มีจุด
                  strokeWidth={2}
                />
              ))}
            </ChartComponent>
          </ResponsiveContainer>
        );
      }
    }

    // สำหรับค่าเดียว (น้ำตาล, น้ำหนัก, รอบเอว)
    if (chartType === "pie") {
      // สำหรับ Pie Chart ต้องมีการจัดรูปแบบข้อมูลที่แตกต่างออกไป
      const pieData = filteredData.map((item) => ({
        name: isYearly
          ? dayjs(item.date).format("BBBB") // แสดงปี พ.ศ. สำหรับรายปี
          : dayjs(item.date).format("D MMM BBBB HH:mm"), // ✅ แสดงวัน เดือน ปี พ.ศ. และเวลาสำหรับรายเดือน/กำหนดเอง
        value: item[key],
      }));
      // กรองข้อมูลที่มีค่าเป็น 0 หรือ null ออกไปจาก Pie Chart เพื่อให้แสดงผลได้ดีขึ้น
      const validPieData = pieData.filter((d) => d.value > 0);

      // ถ้าไม่มีข้อมูลที่ถูกต้อง ไม่ต้องแสดง Pie Chart
      if (validPieData.length === 0) {
        return (
          <div style={{ textAlign: "center", color: "#888" }}>
            ไม่มีข้อมูลสำหรับกราฟวงกลม
          </div>
        );
      }

      return (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <Tooltip formatter={(value) => `${value} ${unit}`} />
            <Pie
              data={validPieData}
              dataKey="value"
              nameKey="name"
              outerRadius={80}
              label={({ name, value }) => `${name}: ${value} ${unit}`}
            >
              {validPieData.map((_, idx) => (
                <Cell key={`cell-${idx}`} fill={color} /> // ใช้สีเดียวกับ metricConfigs
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      );
    } else {
      // สำหรับ Bar Chart หรือ Line Chart (ค่าเดียว)
      const ChartComponent = chartType === "bar" ? BarChart : LineChart;
      const GraphElement = chartType === "bar" ? Bar : Line;
      return (
        <ResponsiveContainer width="100%" height={220}>
          <ChartComponent
            data={filteredData}
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={xAxisTickFormatter} // ✅ ใช้ xAxisTickFormatter
              interval={intervalX}
            />
            <YAxis />
            <Tooltip
              labelFormatter={formatDateLabel} // ✅ ใช้ formatDateLabel ที่แสดงเวลา
              formatter={(value) => `${value} ${unit}`}
            />
            <GraphElement
              type="monotone"
              dataKey={key}
              fill={chartType === "bar" ? color : undefined}
              stroke={chartType === "line" ? color : undefined}
              dot={chartType === "line" ? false : undefined}
              strokeWidth={2}
            />
          </ChartComponent>
        </ResponsiveContainer>
      );
    }
  };

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

import React from "react";
import dayjs from "dayjs";
// ไม่จำเป็นต้อง import buddhistEra ที่นี่โดยตรง หากไม่ได้ใช้การฟอร์แมต พ.ศ.
// แต่ถ้าต้องการใช้ พ.ศ. ใน CombinedChart ด้วย ก็ต้อง extend plugin
// import buddhistEra from "dayjs/plugin/buddhistEra";
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

// หากต้องการให้ CombinedChart แสดงผลเป็น พ.ศ. ด้วย ต้องเปิดบรรทัดนี้
// dayjs.extend(buddhistEra);
// dayjs.locale("th"); // ถ้าต้องการภาษาไทยด้วย

const metricConfig = {
  sugar: { name: "น้ำตาล", unit: "mg/dL", color: "#4caf50", dataKey: "sugar" },
  pressure: {
    name: "ความดันโลหิต",
    unit: "mmHg",
    colors: ["#1890ff", "#13c2c2"], // color for systolic, color for diastolic
    dataKeys: ["systolic", "diastolic"], // Corrected to match your data structure
  },
  weight: { name: "น้ำหนัก", unit: "kg", color: "#fa8c16", dataKey: "weight" },
  waist: { name: "รอบเอว", unit: "cm", color: "#f5222d", dataKey: "waist" },
};

const CombinedChart = ({ data }) => {
  const thisYear = dayjs().year();

  // กรองข้อมูลเฉพาะปีปัจจุบัน และเรียงลำดับตามวันที่
  // ควรตรวจสอบว่า data.date เป็น ISO string ที่ dayjs เข้าใจได้
  const yearData = data
    .filter((item) => dayjs(item.date).year() === thisYear)
    .sort((a, b) => dayjs(a.date).diff(dayjs(b.date))); // ใช้ diff เพื่อเรียงลำดับเวลาที่ละเอียดขึ้น

  // ฟังก์ชันสำหรับ Tooltip label formatter
  // แสดง วันที่ เดือน ปี และ เวลา (ชั่วโมง:นาที)
  const formatTooltipLabel = (val) => dayjs(val).format("DD MMMM YYYY HH:mm");

  // ฟังก์ชันสำหรับ XAxis tick formatter
  // เลือกรูปแบบที่เหมาะสม:
  // - ถ้าข้อมูลเยอะมากๆ ใน 1 เดือน อาจจะแสดงแค่ วันที่และเวลา "DD HH:mm"
  // - ถ้าข้อมูลกระจายตลอดทั้งปี อาจจะแสดงแค่ เดือน "MMM" (เหมือนเดิม)
  // - ตอนนี้จะใช้แบบละเอียดขึ้น (DD MMM HH:mm) สำหรับ XAxis
  const formatXAxisTick = (val) => {
    // กำหนดรูปแบบตามความเหมาะสม
    // ถ้าคุณมีข้อมูลรายเดือน (แต่ละเดือนมีหลายจุด) ควรจะแสดงวันและเวลา
    // ถ้าคุณมีข้อมูลน้อยจุดในแต่ละเดือน (เช่น จุดเดียวต่อเดือน) การแสดงแค่เดือนอาจจะดีกว่า
    // สำหรับตอนนี้เราจะลองแสดง วันที่และเวลา เพื่อให้เห็นรายละเอียด
    return dayjs(val).format("DD MMM HH:mm"); // เช่น "10 ก.ค. 14:16"
  };

  return (
    <div className="combined-chart-container-marin">
      <div className="combined-chart-title-marin">
        ภาพรวมแนวโน้มสุขภาพรายปี ({thisYear + 543})
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={yearData}
          margin={{ top: 60, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxisTick} // ✅ ใช้ formatXAxisTick เพื่อแสดงวันที่และเวลา
            interval="preserveStartEnd" // ช่วยให้ tick แรกและสุดท้ายแสดงผลเสมอ
            // angle={-45} // อาจต้องหมุนป้ายกำกับหากตัวอักษรยาวเกินไป
            // textAnchor="end"
          />
          <YAxis />
          <Tooltip
            labelFormatter={formatTooltipLabel} // ✅ ใช้ formatTooltipLabel เพื่อแสดงวันที่และเวลา
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
            wrapperStyle={{ top: 10, left: 0 }} // ปรับตำแหน่ง Legend ให้อยู่ด้านบน
            height={36}
            formatter={(value) => {
              if (value === "systolic") return "ความดันโลหิตค่าบน";
              if (value === "diastolic") return "ความดันโลหิตค่าล่าง";
              // หา config ที่ตรงกับ dataKey หรือ name
              const cfg = Object.values(metricConfig).find(
                (m) => m.dataKey === value || m.name === value
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
                name={m.name} // ใช้ name สำหรับ Legend
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

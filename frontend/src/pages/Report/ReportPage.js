// src/pages/ReportPage.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ReportPage.css";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";

import PatientSelector from "../../components/Report/PatientSelector";
import {
  PatientInfoCard,
  PatientDetails,
} from "../../components/Report/PatientInfoCard";
import RiskPieChart from "../../components/Report/RiskPieChart";
import CombinedChart from "../../components/Report/CombinedChart";
import ChartControls from "../../components/Report/ChartControls";
import HealthChartGroup from "../../components/Report/HealthChartGroup";
import SummaryMetricCard from "../../components/Report/SummaryMetricCard";

dayjs.extend(buddhistEra);
dayjs.locale("th");

const colorMap = {
  สีแดง: "#ff4d4f",
  สีเหลือง: "#fadb14",
  สีเขียว: "#52c41a",
  สีส้ม: "#fa8c16",
  สีดำ: "#595959",
  สีขาว: "#d9d9d9",
  สีเขียวอ่อน: "#b7f0b1",
  สีเขียวเข้ม: "#4caf50",
};

const riskGroupMap = {
  สีขาว: "กลุ่มปกติ",
  สีเขียวอ่อน: "กลุ่มผู้ป่วยที่มีความเสี่ยงน้อย",
  สีเขียวเข้ม: "กลุ่มผู้ป่วยระดับ 0",
  สีเหลือง: "กลุ่มผู้ป่วยระดับ 1",
  สีส้ม: "กลุ่มผู้ป่วยระดับ 2",
  สีแดง: "กลุ่มผู้ป่วยระดับ 3",
  สีดำ: "กลุ่มผู้ป่วยมีภาวะแทรกซ้อนรุนแรง",
};

const ColorBadge = ({ colorName }) => {
  const trimmedName = colorName?.trim();
  const bg = colorMap[trimmedName] || "#ccc";
  const textColor = ["#ffeb3b", "#ffffff", "#fadb14"].includes(bg)
    ? "#000"
    : "#fff";
  const riskText = riskGroupMap[trimmedName] || "ไม่ระบุ";

  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: 140,
          height: 140,
          borderRadius: "50%",
          backgroundColor: bg,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.95rem",
          fontWeight: 600,
          color: textColor,
        }}
      >
        {colorName || "ไม่ระบุ"}
      </div>
      <div style={{ marginTop: 8, fontSize: "0.95rem", fontWeight: 500 }}>
        {riskText}
      </div>
    </div>
  );
};

const ReportPage = () => {
  const { id } = useParams();
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [lineData, setLineData] = useState([]);
  const [riskColor, setRiskColor] = useState("#ff4d4f");

  // Chart controls state
  const [filterType, setFilterType] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));
  const [selectedYear, setSelectedYear] = useState(dayjs().year().toString());
  const [customRange, setCustomRange] = useState({
    from: dayjs().startOf("month").format("YYYY-MM-DD"),
    to: dayjs().endOf("month").format("YYYY-MM-DD"),
  });
  const [selectedCharts, setSelectedCharts] = useState({
    sugar: true,
    pressure: true,
    weight: true,
    waist: true,
  });
  const [chartType, setChartType] = useState("line");

  // Fetch patient list
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API}/api/reports/patients`)
      .then((res) => {
        setPatients(res.data);
        if (id) {
          setSelectedPatientId(id);
        } else if (res.data.length > 0) {
          setSelectedPatientId(res.data[0].Patient_ID);
        }
      });
  }, [id]);

  // Fetch selected patient & trends
  useEffect(() => {
    if (!selectedPatientId) return;

    const fetchData = async () => {
      try {
        const { data: pd } = await axios.get(
          `${process.env.REACT_APP_API}/api/reports/patient/${selectedPatientId}`
        );
        setSelectedPatient(pd);
        setRiskColor(
          colorMap[pd["กลุ่มเสี่ยงปิงปองจราจร 7 สี"]?.trim()] || "#ff4d4f"
        );

        const { data: trends } = await axios.get(
          `${process.env.REACT_APP_API}/api/reports/healthTrends/${selectedPatientId}`
        );

        // รวมข้อมูล โดยแยก systolic และ diastolic จริงจาก trends
        const merged = trends.bloodSugar.map((item, idx) => ({
          date: item.date,
          sugar: parseFloat(item.value),
          systolic: trends.systolic[idx]?.value || 0,
          diastolic: trends.diastolic[idx]?.value || 0,
          weight: parseFloat(trends.weight[idx]?.value || 0),
          waist: parseFloat(trends.waist[idx]?.value || 0),
        }));
        setLineData(merged);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [selectedPatientId]);

  // Filtered data for HealthChartGroup
  const filteredData = lineData.filter((item) => {
    const date = dayjs(item.date);
    if (filterType === "month") {
      return date.format("YYYY-MM") === selectedMonth;
    }
    if (filterType === "year") {
      return date.year().toString() === selectedYear;
    }
    if (filterType === "custom") {
      return (
        date.isAfter(dayjs(customRange.from).subtract(1, "day")) &&
        date.isBefore(dayjs(customRange.to).add(1, "day"))
      );
    }
    return true;
  });

  // Pie chart data
  const complicationData = selectedPatient
    ? [
        {
          name: "กลุ่มความเสี่ยง",
          value: selectedPatient["%โอกาสเกิดโรคแทรกซ้อน"] ?? 0,
        },
        {
          name: "ปลอดภัย",
          value: 100 - (selectedPatient["%โอกาสเกิดโรคแทรกซ้อน"] ?? 0),
        },
      ]
    : [];

  // Summary metrics (latest vs previous)
  const last = lineData[lineData.length - 1] || {};
  const prev = lineData[lineData.length - 2] || {};
  const summaryMetrics = [
    {
      metricKey: "sugar",
      title: "ระดับน้ำตาลในเลือด",
      value: last.sugar,
      unit: "mg/dL",
      prevValue: prev.sugar,
    },
    {
      metricKey: "pressure",
      title: "ความดันโลหิต",
      value:
        last.systolic && last.diastolic
          ? `${last.systolic}/${last.diastolic}`
          : null,
      unit: "mmHg",
      prevValue:
        prev.systolic && prev.diastolic
          ? `${prev.systolic}/${prev.diastolic}`
          : null,
    },
    {
      metricKey: "weight",
      title: "น้ำหนัก",
      value: last.weight,
      unit: "kg",
      prevValue: prev.weight,
    },
    {
      metricKey: "waist",
      title: "รอบเอว",
      value: last.waist,
      unit: "cm",
      prevValue: prev.waist,
    },
  ];

  return (
    <div className="report-page">
      <h2 className="report-title">รายงานผลสุขภาพ</h2>

      <PatientSelector
        patients={patients}
        selectedId={selectedPatientId}
        onChange={setSelectedPatientId}
      />

      {selectedPatient && (
        <div className="report-card">
          <PatientInfoCard patient={selectedPatient} />

          <div className="info-main">
            <PatientDetails patient={selectedPatient} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
              }}
            >
              <ColorBadge
                colorName={selectedPatient["กลุ่มเสี่ยงปิงปองจราจร 7 สี"]}
              />
              <RiskPieChart
                data={complicationData}
                riskPercent={selectedPatient["%โอกาสเกิดโรคแทรกซ้อน"]}
                riskColor={riskColor}
              />
            </div>
          </div>

          <div className="summary-metrics">
            {summaryMetrics.map((m) => (
              <SummaryMetricCard
                key={m.metricKey}
                metricKey={m.metricKey}
                title={m.title}
                value={m.value}
                unit={m.unit}
                prevValue={m.prevValue}
              />
            ))}
          </div>

          <div className="chart-controls-wrapper">
            {/* CombinedChart: full-year overview */}
            <CombinedChart data={lineData} />

            {/* Controls for filtering HealthChartGroup */}
            <ChartControls
              filterType={filterType}
              setFilterType={setFilterType}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              customRange={customRange}
              setCustomRange={setCustomRange}
              selectedCharts={selectedCharts}
              setSelectedCharts={setSelectedCharts}
              chartType={chartType}
              setChartType={setChartType}
            />

            {/* Filtered health charts */}
            <HealthChartGroup
              data={filteredData}
              selectedCharts={selectedCharts}
              chartType={chartType}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportPage;

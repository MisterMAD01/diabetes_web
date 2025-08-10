// controllers/report/reportController.js
const reportModel = require("../../models/report/reportModel");

exports.getPatients = async (req, res) => {
  try {
    const patients = await reportModel.getPatients();
    res.status(200).json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ message: "Failed to fetch patients" });
  }
};

exports.getReportByPatientId = async (req, res) => {
  try {
    const report = await reportModel.getReportByPatientId(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    // Map field names
    const mappedReport = {
      hn: report.Patient_ID,
      ชื่อ: report.P_Name,
      ที่อยู่: report.Address,
      เบอร์: report.Phone,
      อายุ: report.Age,
      เพศ: report.Gender,
      วันเกิด: report.Birthday,
      เลขบัตรประชาชน: report.Citizen_ID ?? null, // เพิ่มตรงนี้
      "%โอกาสเกิดโรคแทรกซ้อน": report.Risk_Percentage ?? 0,
      "กลุ่มเสี่ยงปิงปองจราจร 7 สี": report.Color ?? null,
    };

    res.status(200).json(mappedReport);
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ message: "Failed to fetch report" });
  }
};

exports.getHealthTrends = async (req, res) => {
  const { id } = req.params;
  try {
    const rows = await reportModel.getHealthTrendsByPatientId(id);
    const formatted = rows.map((r) => ({
      date: r.date,
      sugar: r.sugar,
      pressure: r.pressure, // 120/80
      systolic: r.systolic,
      diastolic: r.diastolic,
      weight: r.weight,
      waist: r.waist,
    }));

    res.json({
      bloodSugar: formatted.map((d) => ({ date: d.date, value: d.sugar })),
      pressureText: formatted.map((d) => ({ date: d.date, value: d.pressure })), // Optional
      systolic: formatted.map((d) => ({ date: d.date, value: d.systolic })),
      diastolic: formatted.map((d) => ({ date: d.date, value: d.diastolic })),
      weight: formatted.map((d) => ({ date: d.date, value: d.weight })),
      waist: formatted.map((d) => ({ date: d.date, value: d.waist })),
    });
  } catch (error) {
    console.error("Error fetching health trends:", error);
    res.status(500).json({ message: "Failed to fetch health trends" });
  }
};

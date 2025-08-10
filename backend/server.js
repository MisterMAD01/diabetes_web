// index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");

const pool = require("./config/db");

const patientRoutes = require("./routes/Patient/PatientRoutes");
const authRoutes = require("./routes/Auth/authRoutes");
const appointmentRoutes = require("./routes/appointment/appointmentRoutes");
const reportRoute = require("./routes/report/reportRoutes");
const errorHandler = require("./middleware/errorHandler");
const userRoutes = require("./routes/user/userRoutes");
const adminRoutes = require("./routes/admin/adminRoutes");
const healthRecordRoutes = require("./routes/healthRecord/healthRecordRoutes");
const exportRoutes = require("./routes/Export/exportRoutes");
const dataManagementRoutes = require("./routes/dataManagement/dataManagementRoutes");
const historyDownloadRoutes = require("./routes/dataManagement/historyDownloadRoutes");
const riskRoutes = require("./routes/getRiskColorRoutes/getRiskColorRoutes");
const doctorRoutes = require("./routes/doctorRoutes/doctorRoutes");
const EditpatientRoutes = require("./routes/Editpatient/EditpatientRoutes");
const CVSRoutes = require("./routes/CVS/CVSRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ตั้งค่า CORS รองรับ local และ deploy
const allowedOrigins = [
  process.env.CLIENT_URL, // URL frontend production
  "http://localhost:3000", // React dev server local
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman, curl
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `CORS policy: The origin ${origin} is not allowed.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

console.log("กำลังเชื่อมต่อฐานข้อมูลด้วย Pool....");

// ทดสอบการเชื่อมต่อฐานข้อมูล
async function testConnection() {
  try {
    const [rows] = await pool.execute("SELECT 1");
    console.log("เชื่อมต่อฐานข้อมูลสำเร็จ!");
  } catch (err) {
    console.error("เชื่อมต่อฐานข้อมูลล้มเหลว:", err);
  }
}
testConnection();

// API test เชื่อมต่อฐานข้อมูล
app.get("/api", async (req, res) => {
  try {
    await pool.execute("SELECT 1");
    res.json({ status: "success", message: "เชื่อมต่อฐานข้อมูลสำเร็จ" });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "เชื่อมต่อฐานข้อมูลล้มเหลว" });
  }
});

// Routes
app.use("/api/patient", patientRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoute);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/risk", riskRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/healthRecordRoutes", healthRecordRoutes);
app.use("/api/cvs", CVSRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/data", dataManagementRoutes, historyDownloadRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patient-edit", EditpatientRoutes);

// Static file serving
app.use("/files", express.static(path.join(__dirname, "Export")));
app.use(
  "/api/user/uploads",
  express.static(path.join(__dirname, "controllers/user/uploads"))
);

// Middleware handle error
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`เซิร์ฟเวอร์กำลังทำงานอยู่บนพอร์ต ${PORT}`);
});

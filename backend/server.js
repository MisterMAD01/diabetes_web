const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const pool = require('./config/db');
const path = require('path'); 

const patientRoutes = require('./routes/Patient/PatientRoutes');
const authRoutes = require('./routes/Auth/authRoutes');
const appointmentRoutes = require('./routes/appointment/appointmentRoutes');
const riskRoutes = require('./routes/riskRoutes');
const reportRoute = require('./routes/report/reportRoutes');
const errorHandler = require('./middleware/errorHandler');
const userRoutes = require('./routes/user/userRoutes');
const adminRoutes = require('./routes/admin/adminRoutes');
const healthRecordRoutes = require('./routes/healthRecord/healthRecordRoutes');
const exportRoutes = require('./routes/Export/exportRoutes');
const dataManagementRoutes = require('./routes/dataManagement/dataManagementRoutes');
const historyDownloadRoutes = require('./routes/dataManagement/historyDownloadRoutes');

const CVSRoutes = require('./routes/CVS/CVSRoutes');

dotenv.config(); // อ่านค่าจากไฟล์ .env


const app = express();
const PORT = process.env.PORT || 5000;

// ตั้งค่า middleware
app.use(cors({
origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.use(express.json());
app.use(bodyParser.json()); // รับข้อมูลในรูปแบบ JSON
app.use(cookieParser());

// เชื่อมต่อกับ MySQL (Pool จะจัดการเอง)
console.log('กำลังเชื่อมต่อฐานข้อมูลด้วย Pool....');

// ทดสอบการเชื่อมต่อ (Optional)
async function testConnection() {
  try {
    const [rows] = await pool.execute('SELECT 1');
    console.log('เชื่อมต่อฐานข้อมูลสำเร็จ!');
  } catch (err) {
    console.error('เชื่อมต่อฐานข้อมูลล้มเหลว:', err);
  }
}

testConnection();

// ตั้งค่า Route
app.use('/api/patient', patientRoutes); // ใช้ patientRoutes สำหรับจัดการผู้ป่วย
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoute);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/user', userRoutes); // การจัดการผู้ใช้
app.use('/api/admin', adminRoutes); // การจัดการของ Admin
app.use('/api/healthRecordRoutes', healthRecordRoutes);
app.use('/api/cvs', CVSRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/data', dataManagementRoutes);
app.use('/api/history', historyDownloadRoutes);


// ให้ React หรือเบราว์เซอร์ดาวน์โหลดไฟล์จาก /files
app.use('/files', express.static(path.join(__dirname, 'Export')));
app.use('/api/user/uploads', express.static(path.join(__dirname, 'controllers/user/uploads')));

// Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`เซิร์ฟเวอร์กำลังทำงานอยู่บนพอร์ต ${PORT}`);
});
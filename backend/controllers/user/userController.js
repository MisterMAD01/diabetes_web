// backend/controllers/user/userController.js
const bcrypt = require("bcrypt");
const path = require("path");
const multer = require("multer");
const pool = require("../../config/db");

// —————————————————————————————
// 1. ตั้งค่า Multer สำหรับอัปโหลด avatar
// —————————————————————————————
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    const userId = req.user.id;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `user_${userId}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/^image\/(jpeg|png)$/)) {
      return cb(new Error("กรุณาอัปโหลดไฟล์ JPG หรือ PNG เท่านั้น"), false);
    }
    cb(null, true);
  },
});

exports.uploadAvatar = upload.single("avatar");

// —————————————————————————————
// 2. ดึงข้อมูลโปรไฟล์ผู้ใช้ (GET /api/user/me)
// —————————————————————————————
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.execute(
      `SELECT id, username, name, email, role, approved, google_id, updated_at, picture,created_at
       FROM users
       WHERE id = ?`,
      [userId]
    );
    if (!rows.length) {
      return res.status(404).json({ message: "ไม่พบข้อมูลผู้ใช้" });
    }
    const user = rows[0];

    const apiBase =
      process.env.API_URL || `${req.protocol}://${req.get("host")}`;
    let avatar_url = null;
    if (user.picture) {
      if (
        user.picture.startsWith("http://") ||
        user.picture.startsWith("https://")
      ) {
        avatar_url = user.picture;
      } else {
        avatar_url = `${apiBase}/api/user/uploads/${user.picture}`;
      }
    }

    // ห่อใน profile ตามที่ front-end คาดหวัง
    res.status(200).json({
      profile: {
        ...user,
        avatar_url,
      },
    });
  } catch (error) {
    console.error("Error in getMe:", error);
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล", error: error.message });
  }
};

// —————————————————————————————
// 3. อัปเดตโปรไฟล์พร้อม avatar (PATCH /api/user/me)
// —————————————————————————————
exports.updateMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name = null,
      email = null,
      username = null,
      deleteAvatar,
    } = req.body || {};

    // 1. ดึงข้อมูล user ปัจจุบัน เพื่อเช็ค google_id
    const [userRows] = await pool.execute(
      "SELECT google_id FROM users WHERE id = ?",
      [userId]
    );
    if (!userRows.length) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }

    const user = userRows[0];

    // 2. ถ้าผู้ใช้สมัครด้วย Google (มี google_id) ห้ามแก้ไข email
    let emailToUpdate = email;
    if (user.google_id && email) {
      emailToUpdate = null;
    }

    // 3. ตรวจสอบว่า username ซ้ำหรือไม่ (ถ้ามีการส่งค่าใหม่มา)
    if (username) {
      const [usernameRows] = await pool.execute(
        "SELECT id FROM users WHERE username = ? AND id != ?",
        [username, userId]
      );
      if (usernameRows.length) {
        return res.status(400).json({ message: "ชื่อผู้ใช้นี้มีอยู่แล้ว" });
      }
    }

    // 4. อัปเดตข้อมูลใน DB
    let sql = "UPDATE users SET";
    const updates = [];
    const params = [];

    if (name !== null) {
      updates.push(" name = ?");
      params.push(name);
    }

    if (emailToUpdate !== null) {
      updates.push(" email = ?");
      params.push(emailToUpdate);
    }

    if (username !== null) {
      updates.push(" username = ?");
      params.push(username);
    }

    if (deleteAvatar === "true") {
      updates.push(" picture = NULL");
    } else if (req.file) {
      updates.push(" picture = ?");
      params.push(req.file.filename);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "ไม่มีข้อมูลที่ต้องอัปเดต" });
    }

    sql += updates.join(",");
    sql += " WHERE id = ?";
    params.push(userId);

    await pool.execute(sql, params);

    res.status(200).json({ message: "อัปเดตโปรไฟล์สำเร็จ" });
  } catch (error) {
    console.error("Error in updateMe:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์",
      error: error.message,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body || {};

    // ตรวจว่ามีข้อมูลครบ
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "กรุณาระบุรหัสผ่านเก่าและใหม่ให้ครบถ้วน" });
    }

    // ดึง hash password เก่าจากฐานข้อมูล
    const [rows] = await pool.execute(
      "SELECT password FROM users WHERE id = ?",
      [userId]
    );
    if (!rows.length) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้ในระบบ" });
    }
    const currentHash = rows[0].password;

    // ตรวจสอบว่า oldPassword ตรงกับ hash ใน DB
    const match = await bcrypt.compare(oldPassword, currentHash);
    if (!match) {
      return res.status(401).json({ message: "รหัสผ่านเก่าไม่ถูกต้อง" });
    }

    // สร้าง hash ใหม่
    const saltRounds = 10;
    const newHash = await bcrypt.hash(newPassword, saltRounds);

    // อัปเดตรหัสผ่านในฐานข้อมูล
    await pool.execute("UPDATE users SET password = ? WHERE id = ?", [
      newHash,
      userId,
    ]);

    return res.status(200).json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
  } catch (error) {
    console.error("Error in changePassword:", error);
    return res.status(500).json({
      message: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน",
      error: error.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT id FROM users");
    res.status(200).json(rows); // rows คือ array ของ user
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
  }
};

// backend/controllers/user/userController.js
const bcrypt = require('bcrypt');
const path = require('path');
const multer = require('multer');
const pool = require('../../config/db');

// —————————————————————————————
// 1. ตั้งค่า Multer สำหรับอัปโหลด avatar
// —————————————————————————————
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const userId = req.user.id;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `user_${userId}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/^image\/(jpeg|png)$/)) {
      return cb(new Error('กรุณาอัปโหลดไฟล์ JPG หรือ PNG เท่านั้น'), false);
    }
    cb(null, true);
  }
});

exports.uploadAvatar = upload.single('avatar');


// —————————————————————————————
// 2. ดึงข้อมูลโปรไฟล์ผู้ใช้ (GET /api/user/me)
// —————————————————————————————
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.execute(
      `SELECT id, username, name, email, role, approved, google_id, updated_at, picture
       FROM users
       WHERE id = ?`,
      [userId]
    );
    if (!rows.length) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้' });
    }
    const user = rows[0];

    const apiBase = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    let avatar_url = null;
    if (user.picture) {
      if (user.picture.startsWith('http://') || user.picture.startsWith('https://')) {
        avatar_url = user.picture;
      } else {
        avatar_url = `${apiBase}/api/user/uploads/${user.picture}`;
      }
    }

    // ห่อใน profile ตามที่ front-end คาดหวัง
    res.status(200).json({
      profile: {
        ...user,
        avatar_url
      }
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
  }
};


// —————————————————————————————
// 3. อัปเดตโปรไฟล์พร้อม avatar (PATCH /api/user/me)
// —————————————————————————————
exports.updateMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name = null, email = null, deleteAvatar } = req.body || {};

    let sql = 'UPDATE users SET name = ?, email = ?';
    const params = [name, email];

    // หากส่ง deleteAvatar=true ให้ตั้ง picture=NULL
    if (deleteAvatar === 'true') {
      sql += ', picture = NULL';
    }
    // หากอัปโหลดไฟล์ใหม่ ให้ตั้ง picture=filename
    else if (req.file) {
      sql += ', picture = ?';
      params.push(req.file.filename);
    }

    sql += ' WHERE id = ?';
    params.push(userId);

    await pool.execute(sql, params);

    res.status(200).json({ message: 'อัปเดตโปรไฟล์สำเร็จ' });
  } catch (error) {
    console.error('Error in updateMe:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์', error: error.message });
  }
};


exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body || {};

    // ตรวจว่ามีข้อมูลครบ
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'กรุณาระบุรหัสผ่านเก่าและใหม่ให้ครบถ้วน' });
    }

    // ดึง hash password เก่าจากฐานข้อมูล
    const [rows] = await pool.execute(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );
    if (!rows.length) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้ในระบบ' });
    }
    const currentHash = rows[0].password;

    // ตรวจสอบว่า oldPassword ตรงกับ hash ใน DB
    const match = await bcrypt.compare(oldPassword, currentHash);
    if (!match) {
      return res.status(401).json({ message: 'รหัสผ่านเก่าไม่ถูกต้อง' });
    }

    // สร้าง hash ใหม่
    const saltRounds = 10;
    const newHash = await bcrypt.hash(newPassword, saltRounds);

    // อัปเดตรหัสผ่านในฐานข้อมูล
    await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [newHash, userId]
    );

    return res.status(200).json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
  } catch (error) {
    console.error('Error in changePassword:', error);
    return res.status(500).json({
      message: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน',
      error: error.message
    });
  }
};
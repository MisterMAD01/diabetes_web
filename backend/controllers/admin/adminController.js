const pool = require("../../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// แสดงบัญชีทั้งหมด
exports.getAllAccounts = async (req, res) => {
  try {
    // เพิ่ม updated_at กับ google_id ใน SELECT
    const [accounts] = await pool.execute(
      `SELECT 
         id, 
         username,
         name, 
         email, 
         role, 
         approved, 
         google_id, 
         updated_at,
         created_at ,
         picture
       FROM users`
    );
    res.status(200).json({ accounts });
  } catch (error) {
    console.error("Failed to fetch accounts:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch accounts", error: error.message });
  }
};

// อนุมัติบัญชีผู้ใช้
exports.approveAccount = async (req, res) => {
  const { userId } = req.params;
  try {
    await pool.execute("UPDATE users SET approved = 1 WHERE id = ?", [userId]);
    res.status(200).json({ message: "Account approved successfully" });
  } catch (error) {
    console.error("Error approving account:", error);
    res.status(500).json({ message: "Failed to approve account" });
  }
};

// แก้ไขข้อมูลบัญชีผู้ใช้
exports.editAccount = async (req, res) => {
  const { userId } = req.params; // รับ ID ผู้ใช้จาก URL
  const { username, name, email, password, role } = req.body; // รับข้อมูลใหม่จาก Body

  try {
    // เช็คว่าผู้ใช้ที่ต้องการแก้ไขมีอยู่ในระบบหรือไม่
    const [userExists] = await pool.execute(
      "SELECT * FROM users WHERE id = ?",
      [userId]
    );
    if (userExists.length === 0) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้ที่ต้องการแก้ไข" });
    }

    let hashedPassword = null;

    // หากมีการส่งรหัสผ่านใหม่มา ให้ทำการเข้ารหัสรหัสผ่าน (hash)
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // อัปเดตข้อมูลผู้ใช้ในฐานข้อมูล
    await pool.execute(
      "UPDATE users SET username = ?, name = ?, email = ?, password = ?, role = ? WHERE id = ?",
      [
        username || userExists[0].username, // ถ้าไม่มีข้อมูลใหม่ ใช้ข้อมูลเดิม
        name || userExists[0].name,
        email || userExists[0].email,
        hashedPassword || userExists[0].password, // หากไม่มีรหัสผ่านใหม่ ใช้รหัสผ่านเดิม
        role || userExists[0].role,
        userId,
      ]
    );

    res.status(200).json({ message: "แก้ไขข้อมูลบัญชีสำเร็จ" });
  } catch (error) {
    console.error("Error editing account:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูลบัญชี" });
  }
};

// ลบบัญชีผู้ใช้
exports.deleteAccount = async (req, res) => {
  const { userId } = req.params;
  try {
    await pool.execute("DELETE FROM users WHERE id = ?", [userId]);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Failed to delete account" });
  }
};

// ไม่อนุมัติบัญชีผู้ใช้
exports.rejectAccount = async (req, res) => {
  const { userId } = req.params;
  try {
    await pool.execute("UPDATE users SET approved = 0 WHERE id = ?", [userId]);
    res.status(200).json({ message: "Account disapproved successfully" });
  } catch (error) {
    console.error("Error disapproving account:", error);
    res.status(500).json({ message: "Failed to disapprove account" });
  }
};

// ฟังก์ชันเพิ่มบัญชี
exports.AddAccount = async (req, res) => {
  const { username, name, email, password, role } = req.body;

  try {
    // ตรวจสอบว่า Username หรือ Email ซ้ำกันหรือไม่
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (rows.length > 0) {
      return res.status(400).json({
        message: "Username หรือ Email นี้มีผู้ใช้งานแล้ว",
      });
    }

    // เข้ารหัสรหัสผ่าน (Hash Password)
    const hashedPassword = await bcrypt.hash(password, 10);

    // เพิ่มผู้ใช้ใหม่ในฐานข้อมูล
    const [insertResult] = await pool.execute(
      "INSERT INTO users (username, name, email, password, role, approved) VALUES (?, ?, ?, ?, ?, ?)",
      [username, name, email, hashedPassword, role, false] // เริ่มต้นด้วย approved = false
    );

    res.status(201).json({
      message: "เพิ่มบัญชีผู้ใช้สำเร็จ โปรดรอการอนุมัติจาก Admin",
      userId: insertResult.insertId,
    });
  } catch (error) {
    console.error("Error adding account:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการเพิ่มบัญชี",
      error: error.message,
    });
  }
};

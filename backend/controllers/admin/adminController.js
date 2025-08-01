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
  const { userId } = req.params;
  const { username, name, email, password, role } = req.body;

  try {
    const [userExists] = await pool.execute(
      "SELECT * FROM users WHERE id = ?",
      [userId]
    );
    if (userExists.length === 0) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้ที่ต้องการแก้ไข" });
    }

    const user = userExists[0];

    // ถ้าผูกกับ Google แล้ว (มี google_id) ห้ามแก้ไข email
    if (user.google_id && email && email !== user.email) {
      return res.status(400).json({
        message: "บัญชีที่ผูกกับ Google ไม่สามารถแก้ไขอีเมลได้",
      });
    }

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    await pool.execute(
      "UPDATE users SET username = ?, name = ?, email = ?, password = ?, role = ? WHERE id = ?",
      [
        username || user.username,
        name || user.name,
        email || user.email,
        hashedPassword || user.password,
        role || user.role,
        userId,
      ]
    );

    res.status(200).json({ message: "แก้ไขข้อมูลบัญชีสำเร็จ" });
  } catch (error) {
    console.error("Error editing account:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ message: "อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้ email อื่น" });
    }

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
exports.AddAccount = async (req, res) => {
  const { username, name, email, password, role } = req.body;

  try {
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (rows.length > 0) {
      return res.status(400).json({
        message: "Username หรือ Email นี้มีผู้ใช้งานแล้ว",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [insertResult] = await pool.execute(
      "INSERT INTO users (username, name, email, password, role, approved) VALUES (?, ?, ?, ?, ?, ?)",
      [username, name, email, hashedPassword, role, false]
    );

    // ดึงข้อมูล user ใหม่จากฐานข้อมูล
    const [newUserRows] = await pool.execute(
      "SELECT id, username, name, email, role, approved, google_id, updated_at, created_at, picture FROM users WHERE id = ?",
      [insertResult.insertId]
    );

    const newUser = newUserRows[0];

    res.status(201).json({
      message: "เพิ่มบัญชีผู้ใช้สำเร็จ โปรดรอการอนุมัติจาก Admin",
      user: newUser,
    });
  } catch (error) {
    console.error("Error adding account:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการเพิ่มบัญชี",
      error: error.message,
    });
  }
};

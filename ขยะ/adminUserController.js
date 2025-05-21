const bcrypt = require('bcryptjs');
const db = require('../backend/config/db');

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.execute('SELECT id, username, name, email, role, approved FROM users');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้ทั้งหมด' });
  }
};

exports.createUser = async (req, res) => {
  const { username, name, email, password, role = 'user' } = req.body;
  try {
    const [existingUser] = await db.execute('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Username หรือ Email นี้มีผู้ใช้งานแล้ว' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute('INSERT INTO users (username, name, email, password, role) VALUES (?, ?, ?, ?, ?)', [username, name, email, hashedPassword, role]);
    res.status(201).json({ message: 'สร้างผู้ใช้สำเร็จ', userId: result.insertId });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const [user] = await db.execute('SELECT id, username, name, email, role, approved FROM users WHERE id = ?', [req.params.id]);
    if (user.length === 0) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    }
    res.status(200).json(user[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
  }
};

exports.updateUser = async (req, res) => {
  const { username, name, email, password, role, approved } = req.body;
  try {
    const [existingUser] = await db.execute('SELECT * FROM users WHERE (username = ? OR email = ?) AND id != ?', [username, email, req.params.id]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Username หรือ Email นี้มีผู้ใช้งานอื่นแล้ว' });
    }

    const updateFields = { username, name, email, role, approved };
    if (password) {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    const setClause = Object.keys(updateFields)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = Object.values(updateFields);
    values.push(req.params.id);

    await db.execute(`UPDATE users SET ${setClause} WHERE id = ?`, values);
    res.status(200).json({ message: 'แก้ไขข้อมูลผู้ใช้สำเร็จ' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ใช้' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.status(200).json({ message: 'ลบผู้ใช้สำเร็จ' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบผู้ใช้' });
  }
};

exports.approveUser = async (req, res) => {
  const { userId } = req.params;  // ดึง ID ของผู้ใช้จาก params
  try {
    // ตรวจสอบว่าผู้ใช้มีสถานะ approved อยู่แล้วหรือไม่
    const [user] = await db.execute('SELECT id, approved FROM users WHERE id = ?', [userId]);
    
    if (user.length === 0) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    }

    if (user[0].approved) {
      return res.status(400).json({ message: 'บัญชีนี้ได้รับการอนุมัติแล้ว' });
    }

    // อัปเดตสถานะผู้ใช้ให้เป็น approved
    await db.execute('UPDATE users SET approved = ? WHERE id = ?', [true, userId]);

    res.status(200).json({ message: 'บัญชีผู้ใช้ได้รับการอนุมัติแล้ว' });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอนุมัติผู้ใช้' });
  }
};

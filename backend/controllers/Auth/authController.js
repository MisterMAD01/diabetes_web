const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const db = require("../../config/db");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const path = require("path");
const fs = require("fs");
const axios = require("axios");

// ฟังก์ชัน Verify Google ID Token
async function verifyGoogleToken(token) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return {
      googleId: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    };
  } catch (error) {
    console.error("Error verifying Google token:", error);
    return null;
  }
}

// ฟังก์ชันสมัครสมาชิก (แบบปกติ)
exports.registerUser = async (req, res) => {
  const { username, name, email, password } = req.body;
  try {
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email]
    );
    if (rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Username หรือ Email นี้มีผู้ใช้งานแล้ว" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [insertResult] = await db.execute(
      "INSERT INTO users (username, name, email, password) VALUES (?, ?, ?, ?)",
      [username, name, email, hashedPassword]
    );

    res.status(201).json({
      message: "ลงทะเบียนผู้ใช้สำเร็จ โปรดรอการอนุมัติจาก Admin",
      userId: insertResult.insertId,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการลงทะเบียนผู้ใช้",
      error: error.message,
    });
  }
};

exports.loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier) {
    return res.status(400).json({ message: "กรุณาระบุ Username หรือ Email" });
  }
  if (!password) {
    return res.status(400).json({ message: "กรุณาระบุรหัสผ่าน" });
  }

  try {
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [identifier, identifier]
    );

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ message: "ชื่อผู้ใช้ หรือ Email ไม่ถูกต้อง" });
    }

    const user = rows[0];
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });
    }

    if (!user.approved) {
      return res
        .status(403)
        .json({ message: "บัญชีของคุณยังไม่ได้รับการอนุมัติ" });
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "เข้าสู่ระบบสำเร็จ", token: accessToken });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
      error: error.message,
    });
  }
};

// ฟังก์ชัน refresh token
exports.refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "ไม่มี refresh token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [
      payload.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }

    const user = rows[0];
    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ token: accessToken });
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Refresh token ไม่ถูกต้องหรือล้าสมัย" });
  }
};

// ฟังก์ชัน logout
exports.logout = (req, res) => {
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "ออกจากระบบสำเร็จ" });
};

// ฟังก์ชัน authGoogleUser แก้ไขเพิ่มการดาวน์โหลดรูป
exports.authGoogleUser = async (req, res) => {
  const { googleIdToken } = req.body;
  const googleUser = await verifyGoogleToken(googleIdToken);

  if (!googleUser) {
    return res.status(400).json({ message: "Google ID Token ไม่ถูกต้อง" });
  }

  const email = googleUser.email;
  let username = email.split("@")[0];

  try {
    // ตรวจสอบว่ามี user ด้วย google_id แล้วหรือยัง
    const [existingUserRows] = await db.execute(
      "SELECT * FROM users WHERE google_id = ?",
      [googleUser.googleId]
    );

    if (existingUserRows.length > 0) {
      const user = existingUserRows[0];
      if (!user.approved) {
        return res
          .status(403)
          .json({ message: "บัญชีของคุณยังไม่ได้รับการอนุมัติ" });
      }

      // เข้าสู่ระบบ
      const accessToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );
      const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res
        .status(200)
        .json({ message: "เข้าสู่ระบบด้วย Google สำเร็จ", token: accessToken });
    }

    // ป้องกัน username ซ้ำ
    const [userCheck] = await db.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (userCheck.length > 0) {
      username += Math.floor(Math.random() * 1000);
    }

    // สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
    const uploadsDir = path.join(__dirname, "..", "user", "uploads");

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // ดาวน์โหลดรูปโปรไฟล์ Google มาเก็บใน backend/user/uploads
    let pictureFilename = null;
    if (googleUser.picture) {
      try {
        const pictureUrl = googleUser.picture;
        const ext = path.extname(new URL(pictureUrl).pathname) || ".jpg";
        pictureFilename = `google_${Date.now()}${ext}`;
        const picturePath = path.join(uploadsDir, pictureFilename);

        console.log("Saving Google profile picture to:", picturePath);

        const response = await axios({
          url: pictureUrl,
          method: "GET",
          responseType: "stream",
        });

        await new Promise((resolve, reject) => {
          const writer = fs.createWriteStream(picturePath);
          response.data.pipe(writer);
          writer.on("finish", resolve);
          writer.on("error", reject);
        });
      } catch (err) {
        console.error("Error downloading Google profile picture:", err);
      }
    }

    // บันทึก user ใหม่ลง DB พร้อม picture filename
    const [insertResult] = await db.execute(
      "INSERT INTO users (google_id, username, name, email, password, approved, picture) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        googleUser.googleId,
        username,
        googleUser.name,
        googleUser.email,
        "GOOGLE_ONLY",
        0,
        pictureFilename,
      ]
    );

    return res.status(201).json({
      message: "สมัครด้วย Google สำเร็จ โปรดรอการอนุมัติจาก Admin",
      userId: insertResult.insertId,
    });
  } catch (error) {
    console.error("Error in Google Auth:", error);
    return res.status(500).json({
      message: "เกิดข้อผิดพลาดในการยืนยันตัวตนด้วย Google",
      error: error.message,
    });
  }
};

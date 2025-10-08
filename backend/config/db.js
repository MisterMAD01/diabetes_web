const sqlite3 = require("sqlite3");
const path = require("path");

// Function to run multiple SQL statements sequentially
function runMigrations(db, sqlStatements) {
  db.serialize(() => {
    db.exec(sqlStatements, (err) => {
      if (err) {
        console.error(
          "❌ Database initialization failed (DDL/DML):",
          err.message
        );
      } else {
        console.log(
          "✅ Database tables and initial data ensured (Migrations complete)."
        );
      }
    });
  });
}

// ----------------------------------------------------------------------
// 1. SQL SCHEMA (TABLE CREATION) & INITIAL DATA
// ----------------------------------------------------------------------

const INITIAL_SCHEMA = `
-- Table: users
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  google_id TEXT UNIQUE,
  approved INTEGER DEFAULT 0,
  role TEXT NOT NULL DEFAULT 'user',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  picture TEXT
);

-- Table: patient
CREATE TABLE IF NOT EXISTS patient (
  Patient_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Citizen_ID TEXT,
  P_Name TEXT,
  Address TEXT,
  Phone_Number TEXT,
  Age INTEGER,
  Gender TEXT,
  Birthdate DATE,
  Underlying_Disease TEXT,
  Risk REAL,
  Color TEXT
);

-- Table: doctors
CREATE TABLE IF NOT EXISTS doctors (
  Doctor_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  D_Name TEXT NOT NULL,
  specialty TEXT,
  phone TEXT,
  email TEXT
);

-- Table: appointments
CREATE TABLE IF NOT EXISTS appointments (
  Appointment_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Patient_ID INTEGER NOT NULL,
  Appointment_Date DATE NOT NULL,
  Appointment_Time TIME NOT NULL,
  Reason TEXT,
  Status TEXT DEFAULT 'รอพบแพทย์',
  Created_At DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Doctor_ID INTEGER,
  FOREIGN KEY (Patient_ID) REFERENCES patient(Patient_ID) ON DELETE CASCADE
);

-- Table: health_data
CREATE TABLE IF NOT EXISTS health_data (
  Health_Data_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Patient_ID INTEGER,
  Diabetes_Mellitus TEXT DEFAULT 'ไม่ป่วยเป็นเบาหวาน',
  Blood_Pressure TEXT,
  Systolic_BP INTEGER,
  Diastolic_BP INTEGER,
  Blood_Sugar REAL,
  Height REAL,
  Weight REAL,
  Waist REAL,
  Smoke TEXT,
  Note TEXT,
  Date_Recorded DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  HbA1c REAL,
  FOREIGN KEY (Patient_ID) REFERENCES patient (Patient_ID) ON DELETE CASCADE
);

-- Table: download_logs
CREATE TABLE IF NOT EXISTS download_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  table_name TEXT NOT NULL,
  filename TEXT NOT NULL,
  download_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_health_data_patient_id ON health_data(Patient_ID);
CREATE INDEX IF NOT EXISTS idx_health_data_date_recorded ON health_data(Date_Recorded);

-- Insert initial Admin user (ON CONFLICT prevents duplicates if run multiple times)
INSERT INTO users (id, username, name, email, password, google_id, approved, role, created_at, updated_at, picture)
VALUES (
  1,
  'admin',
  'Admin Test',
  'Admin@gmail.com',
  '$2b$10$hWvJgZK4q0Zk3.MMxfIgmusLTCd8RMs1/Pr18NTFaDSq0xwv/T1yG',
  NULL,
  1,
  'admin',
  '2025-04-22 12:05:42',
  '2025-09-28 13:58:45',
  'user_1.jpg'
) ON CONFLICT(id) DO NOTHING;
`;

// ----------------------------------------------------------------------
// 2. CONNECTION AND POOL.EXECUTE() EMULATION
// ----------------------------------------------------------------------

const dbPath = path.join(__dirname, "../..", "data", "app_database.sqlite");

const pool = new sqlite3.Database(
  dbPath,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      // If file doesn't exist, try creating the directory first (important for pkg)
      if (err.code === "ENOENT") {
        // We don't implement full recursive directory creation here for brevity,
        // but ensure B:\Coding\diabetes\diabetes_web\backend\data exists manually if necessary.
        console.error(
          `❌ SQLite file not found: ${dbPath}. Ensure the 'data' directory exists!`
        );
      }
      console.error(`❌ SQLite connection failed:`, err.message);
    } else {
      console.log(`✅ SQLite connected to: ${dbPath}`);
      // Run schema creation and initial inserts immediately upon successful connection
      runMigrations(pool, INITIAL_SCHEMA);
    }
  }
);

// Emulate the mysql2/promise pool.execute() method
pool.execute = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    // Use db.all() for SELECT statements
    if (sql.trim().toUpperCase().startsWith("SELECT")) {
      this.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        // Returns rows and field info (null for SQLite)
        resolve([rows, null]);
      });
    }
    // Use db.run() for INSERT, UPDATE, DELETE statements
    else {
      this.run(sql, params, function (err) {
        if (err) return reject(err);
        // Returns object with lastID and changes (for affectedRows)
        resolve([{ insertId: this.lastID, affectedRows: this.changes }, null]);
      });
    }
  });
};

module.exports = pool;

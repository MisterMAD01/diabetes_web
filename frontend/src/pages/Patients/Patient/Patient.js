import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddPatientForm from "./AddPatient";
import AddHealthData from "./AddhealthData";
import { FaEye, FaEdit, FaNotesMedical } from "react-icons/fa";
import "./Patient.css";

const API_URL = process.env.REACT_APP_API;

const AllPatients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showHealthPopup, setShowHealthPopup] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/patient/all`);
      if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลผู้ป่วยได้");
      const data = await res.json();
      setPatients(data);
      setError(null);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleAddSuccess = () => {
    setShowAddPopup(false);
    fetchPatients();
  };

  const handleHealthSuccess = async () => {
    setShowHealthPopup(false);
    if (selectedPatientId) {
      await fetch(`${API_URL}/api/patient/${selectedPatientId}/update-color`, {
        method: "POST",
      });
    }
    fetchPatients();
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.citizenId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPatients = filteredPatients.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // ฟังก์ชันสร้าง range หน้า pagination ตามที่ขอ (เช่น 123..10, 456..10)
  const getPaginationRange = () => {
    const total = totalPages;
    const current = currentPage;
    const range = [];

    if (total <= 5) {
      // ถ้าน้อยกว่าหรือเท่ากับ 5 หน้า แสดงทุกหน้าเลย
      for (let i = 1; i <= total; i++) range.push(i);
    } else {
      if (current <= 3) {
        // หน้าแรก ๆ แสดง 1 2 3 ... last
        range.push(1, 2, 3, "...", total);
      } else if (current >= total - 2) {
        // หน้าสุดท้าย แสดง first ... last-2 last-1 last
        range.push(1, "...", total - 2, total - 1, total);
      } else {
        // กลาง ๆ แสดง first ... current-1 current current+1 ... last
        range.push(1, "...", current - 1, current, current + 1, "...", total);
      }
    }

    return range;
  };

  return (
    <div className="main-area">
      <div className="all-patients-wrapper">
        <div className="page-header">
          <h2 className="patient-title">รายชื่อผู้ป่วย</h2>
          <div className="header-actions">
            <input
              className="search-input"
              placeholder="ค้นหาผู้ป่วย"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // รีเซ็ตหน้าเมื่อค้นหาใหม่
              }}
            />
            <button
              className="add-button"
              onClick={() => setShowAddPopup(true)}
            >
              + เพิ่มข้อมูลผู้ป่วย
            </button>
          </div>
        </div>

        {loading && <div className="loading-text">⏳ กำลังโหลดข้อมูล...</div>}
        {error && <div className="error-text">{error}</div>}

        <div className="patient-table">
          <div className="patient-row patient-header">
            <div>เลขบัตรประชาชน</div>
            <div>ชื่อ-นามสกุล</div>
            <div>อายุ</div>
            <div>เบอร์โทร</div>
            <div>โรคประจำตัว</div>
            <div>กลุ่มเสี่ยง</div>
            <div>การจัดการ</div>
          </div>

          {currentPatients.map((patient) => (
            <div key={patient.id} className="patient-row">
              <div>{patient.citizenId || "-"}</div>
              <div>{patient.name}</div>
              <div>{patient.age || "-"}</div>
              <div>{patient.phone || "-"}</div>
              <div>{patient.Underlying_Disease || "-"}</div>
              <div>
                <span
                  className={`risk-tag ${patient.color_level
                    ?.replace("สี", "")
                    .toLowerCase()}`}
                >
                  {patient.color_level || "-"}
                </span>
              </div>
              <div>
                <div className="p-action-buttons">
                  <button
                    className="p-view-btn"
                    onClick={() => navigate(`/report/${patient.id}`)}
                    title="ดูข้อมูล"
                  >
                    <FaEye />
                  </button>

                  <button
                    className="p-update-btn"
                    onClick={() => {
                      setSelectedPatientId(patient.id);
                      setShowHealthPopup(true);
                    }}
                    title="อัปเดตสุขภาพ"
                  >
                    <FaNotesMedical />
                  </button>

                  <button
                    className="p-edit-btn"
                    onClick={() => navigate(`/edit-patient/${patient.id}`)}
                    title="แก้ไขข้อมูล"
                  >
                    <FaEdit />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-controls">
            <button
              className="page-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ก่อนหน้า
            </button>

            {getPaginationRange().map((page, idx) =>
              page === "..." ? (
                <span key={idx} className="dots">
                  ...
                </span>
              ) : (
                <button
                  key={idx}
                  className={`page-btn ${currentPage === page ? "active" : ""}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              )
            )}

            <button
              className="page-btn"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              ถัดไป
            </button>
          </div>
        )}

        {/* Popups */}
        {showAddPopup && (
          <AddPatientForm
            onSuccess={handleAddSuccess}
            closePopup={() => setShowAddPopup(false)}
          />
        )}

        {showHealthPopup && selectedPatientId && (
          <AddHealthData
            patientId={selectedPatientId}
            onSuccess={handleHealthSuccess}
            closePopup={() => setShowHealthPopup(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AllPatients;

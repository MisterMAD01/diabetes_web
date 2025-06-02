import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddPatientForm from './AddPatient';
import AddHealthData from './AddhealthData';
import './Patient.css';

const API_URL = process.env.REACT_APP_API;


const AllPatients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showHealthPopup, setShowHealthPopup] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/patient/all`);
      if (!res.ok) throw new Error('ไม่สามารถโหลดข้อมูลผู้ป่วยได้');
      const data = await res.json();
      setPatients(data);
      setError(null);
    } catch (err) {
      setError('❌ เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ป่วย');
      console.error('Error fetching patients:', err);
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
       method: 'POST'
    });

    }
    fetchPatients();
  };

  const filteredPatients = patients.filter((patient) =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

  return (
      <div className="main-area">
        <div className="all-patients-wrapper">
          <div className="page-header">
            <h1>รายชื่อผู้ป่วย</h1>
            <div className="header-actions">
              <input
                className="search-input"
                placeholder="🔍 ค้นหาผู้ป่วย..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <button className="add-button" onClick={() => setShowAddPopup(true)}>
                + เพิ่มข้อมูลผู้ป่วย
              </button>
            </div>
          </div>

          {loading && <div className="loading-text">⏳ กำลังโหลดข้อมูล...</div>}
          {error && <div className="error-text">{error}</div>}

          <div className="patient-table">
            <div className="patient-row patient-header">
              <div>HN</div>
              <div>ชื่อ-นามสกุล</div>
              <div>อายุ</div>
              <div>เบอร์โทร</div>
              <div>โรคประจำตัว</div>
              <div>กลุ่มเสี่ยง</div>
              <div>การจัดการ</div>
            </div>

            {currentPatients.map((patient) => (
              <div key={patient.id} className="patient-row">
                <div>{patient.id}</div>
                <div>{patient.name}</div>
                <div>{patient.age || '-'}</div>
                <div>{patient.phone || '-'}</div>
                <div>{patient.Underlying_Disease || '-'}</div>
                <div>
                  <span className={`risk-tag ${patient.color_level?.replace('สี', '').toLowerCase()}`}>
                    {patient.color_level || '-'}
                  </span>
                </div>
                <div>
  <button
    className="details-btn"
    onClick={() => navigate(`/report/${patient.id}`)}
  >
    ดูข้อมูล
  </button>
  <button
    className="details-btn"
    style={{ marginLeft: '8px', backgroundColor: '#28a745' }}
    onClick={() => {
      setSelectedPatientId(patient.id);
      setShowHealthPopup(true);
    }}
  >
    อัปเดต
  </button>
</div>

              </div>
            ))}
          </div>

          {/* ✅ Pagination */}
          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                className="page-btn"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ก่อนหน้า
              </button>
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                className="page-btn"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                ถัดไป
              </button>
            </div>
          )}

          {/* ✅ Popups */}
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

import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ExportPage.css";

const API_URL = process.env.REACT_APP_API;

const ExportPage = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [exportFormat, setExportFormat] = useState(null);
  const [isConfirmingExport, setIsConfirmingExport] = useState(false);

  const itemsPerPage = 8;

  // โหลดข้อมูลผู้ป่วยเมื่อคอมโพเนนต์ mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("กรุณาเข้าสู่ระบบเพื่อดำเนินการ");
      return;
    }

    axios
      .get(`${API_URL}/api/export/all-patients`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const mapped = res.data.map((p) => ({
          id: p.ID,
          name: p.Name,
          hn: p.HN || `HN: ${p.ID}`,
          citizenId: p.Citizen_ID || "", // เพิ่มเลขบัตรประชาชน
        }));
        setPatients(mapped);
      })
      .catch(() => {
        toast.error("โหลดผู้ป่วยล้มเหลว");
      });
  }, []);

  // กรองรายชื่อผู้ป่วยตามคำค้นหา (ชื่อหรือเลขบัตรประชาชน)
  const filteredPatients = patients.filter((p) => {
    const name = (p.name || "").toString().toLowerCase();
    const citizenId = (p.citizenId || p.Citizen_ID || "").toString(); // รองรับหลายรูปแบบ key
    const searchLower = search.toString().toLowerCase();

    return (
      name.includes(searchLower) || citizenId.includes(searchLower) // เลขบัตรใช้ includes แบบไม่แปลงเป็น lower เพราะเป็นตัวเลข
    );
  });

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

  // ข้อมูลผู้ป่วยในหน้าปัจจุบัน
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // สร้าง range หน้า pagination พร้อมแทรก "..." (ellipsis)
  const getPaginationRange = () => {
    const total = totalPages;
    const current = currentPage;
    const range = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) range.push(i);
    } else {
      if (current <= 3) {
        range.push(1, 2, 3, "...", total);
      } else if (current >= total - 2) {
        range.push(1, "...", total - 2, total - 1, total);
      } else {
        range.push(1, "...", current - 1, current, current + 1, "...", total);
      }
    }
    return range;
  };

  // จัดการเลือกหรือยกเลิกเลือกผู้ป่วยทั้งหมดบนหน้าปัจจุบัน (filtered)
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(filteredPatients.map((p) => p.id));
    }
    setSelectAll(!selectAll);
  };

  // จัดการเลือก/ยกเลิกเลือกผู้ป่วยทีละคน
  const handleSelect = (id) => {
    setSelectedPatients((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  // เริ่มกระบวนการ export (เลือกประเภทไฟล์และแสดง confirm modal)
  const handleExport = (format) => {
    if (selectedPatients.length === 0) {
      toast.warn("กรุณาเลือกผู้ป่วยที่ต้องการ export");
      return;
    }
    setExportFormat(format);
    setIsConfirmingExport(true);
  };

  // ยืนยันการส่งออกไฟล์และดาวน์โหลด
  const confirmExport = async () => {
    setIsConfirmingExport(false);
    const queryParam = selectedPatients.join(",");
    const url =
      exportFormat === "PDF"
        ? `${API_URL}/api/export/pdf?id=${queryParam}`
        : `${API_URL}/api/export/excel?ids=${queryParam}`;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("กรุณาเข้าสู่ระบบเพื่อดำเนินการ");
      return;
    }

    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const blob = new Blob([response.data]);
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      const date = new Date().toLocaleDateString("th-TH").replace(/\//g, "-");
      const idsLabel = selectedPatients.join(",");
      link.download = `${date} ข้อมูลผู้ป่วย ${idsLabel}.${
        exportFormat === "PDF" ? "pdf" : "xlsx"
      }`;
      link.click();

      toast.success("ส่งออกข้อมูลสำเร็จ");
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการส่งออกข้อมูล");
    }
  };

  return (
    <div className="export-container">
      <h2 className="export-title">Export ข้อมูล</h2>

      <div className="export-controls">
        <input
          type="text"
          placeholder="ค้นหาผู้ป่วย"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
        <button onClick={handleSelectAll}>
          {selectAll ? "ยกเลิกเลือกทั้งหมด" : "เลือกทั้งหมด"}
        </button>
        <button onClick={() => handleExport("PDF")}>Export PDF</button>
        <button onClick={() => handleExport("XLSX")}>Export XLSX</button>
      </div>

      <div className="patient-cards-grid">
        {paginatedPatients.map((patient) => (
          <div
            key={patient.id}
            className={`patient-card ${
              selectedPatients.includes(patient.id) ? "selected" : ""
            }`}
            onClick={() => handleSelect(patient.id)} // <-- เพิ่มตรงนี้
          >
            <input
              type="checkbox"
              className="card-checkbox"
              checked={selectedPatients.includes(patient.id)}
              onChange={(e) => {
                e.stopPropagation(); // ป้องกัน event ซ้อน
                handleSelect(patient.id);
              }}
            />
            <div className="avatar">{patient.name.charAt(0)}</div>
            <div className="patient-info">
              <div className="name-line">{patient.name}</div>
              <div className="hn">{patient.citizenId}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        หน้าที่ {currentPage} จาก {totalPages}
        <div className="pagination-buttons">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
                onClick={() => setCurrentPage(page)}
                className={currentPage === page ? "active" : ""}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            ถัดไป
          </button>
        </div>
      </div>

      {isConfirmingExport && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>คุณกำลังจะส่งออกเป็น {exportFormat}</h3>
            <div
              className="export-patient-list"
              style={{
                maxHeight: 150,
                overflowY: "auto",
                border: "1px solid #ccc",
                padding: "0.5rem",
                margin: "1rem 0",
                borderRadius: "8px",
                background: "#f9f9f9",
              }}
            >
              {patients
                .filter((p) => selectedPatients.includes(p.id))
                .map((p) => (
                  <div key={p.id} style={{ padding: "0.25rem 0" }}>
                    <span className="patient-name">{p.name}</span>{" "}
                    <span className="patient-hn">({p.citizenId})</span>
                  </div>
                ))}
            </div>
            <div className="modal-actions">
              <button
                className="cancel"
                onClick={() => setIsConfirmingExport(false)}
              >
                ยกเลิก
              </button>
              <button className="confirm" onClick={confirmExport}>
                ยืนยันส่งออก
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ExportPage;

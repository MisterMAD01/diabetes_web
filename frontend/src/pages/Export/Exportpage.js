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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("กรุณาเข้าสู่ระบบเพื่อดำเนินการ");
      return;
    }

    axios
      .get(`${API_URL}/api/export/all-patients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const mapped = res.data.map((p) => ({
          id: p.ID,
          name: p.Name,
          hn: p.HN || `HN: ${p.ID}`,
        }));
        setPatients(mapped);
      })
      .catch((err) => {
        console.error("โหลดผู้ป่วยล้มเหลว", err);
        toast.error("โหลดผู้ป่วยล้มเหลว");
      });
  }, []);

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.hn.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExport = (format) => {
    if (selectedPatients.length === 0) {
      toast.warn("กรุณาเลือกผู้ป่วยที่ต้องการ export");
      return;
    }
    setExportFormat(format);
    setIsConfirmingExport(true);
  };

  const confirmExport = async () => {
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      console.error("Error exporting data:", error);
      toast.error("เกิดข้อผิดพลาดในการส่งออกข้อมูล");
    }

    setIsConfirmingExport(false);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(filteredPatients.map((p) => p.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelect = (id) => {
    setSelectedPatients((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  return (
    <div className="export-container">
      <h2>Export ข้อมูล</h2>
      <div className="export-controls">
        <input
          type="text"
          placeholder="ค้นหา"
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
          >
            <input
              type="checkbox"
              className="card-checkbox"
              checked={selectedPatients.includes(patient.id)}
              onChange={() => handleSelect(patient.id)}
            />
            <div className="avatar">{patient.name.charAt(0)}</div>
            <div className="patient-info">
              <div className="name-line">{patient.name}</div>
              <div className="hn">{patient.hn}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        หน้าที่ {currentPage} จาก {totalPages}
        <div className="pagination-buttons">
          <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}>
            ก่อนหน้า
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={currentPage === i + 1 ? "active" : ""}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          >
            ถัดไป
          </button>
        </div>
      </div>

      {isConfirmingExport && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>คุณกำลังจะส่งออกเป็น {exportFormat}</h3>
            <ul className="export-patient-list">
              {patients
                .filter((p) => selectedPatients.includes(p.id))
                .map((p) => (
                  <li key={p.id}>
                    <span className="patient-name">{p.name}</span>{" "}
                    <span className="patient-hn">({p.hn})</span>
                  </li>
                ))}
            </ul>
            <div className="modal-actions">
              <button className="confirm" onClick={confirmExport}>
                ยืนยันส่งออก
              </button>
              <button
                className="cancel"
                onClick={() => setIsConfirmingExport(false)}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default ExportPage;

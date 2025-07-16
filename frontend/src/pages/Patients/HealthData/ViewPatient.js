import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PatientInfo from "../../components/Patient/HealthData/PatientInfo";
import { toast } from "react-toastify";

// ฟังก์ชันสร้าง confirm toast แบบ custom
const confirmToast = (message, onConfirm, onCancel) => {
  const ToastContent = () => (
    <div>
      <p>{message}</p>
      <div style={{ marginTop: 10 }}>
        <button
          onClick={() => {
            toast.dismiss();
            onConfirm();
          }}
        >
          ใช่
        </button>
        <button
          onClick={() => {
            toast.dismiss();
            onCancel();
          }}
        >
          ไม่
        </button>
      </div>
    </div>
  );

  toast.info(<ToastContent />, {
    position: "top-center",
    autoClose: false,
    closeOnClick: false,
    closeButton: false,
    draggable: false,
  });
};

const API_URL = process.env.REACT_APP_API;

const ViewPatient = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);
  const [error, setError] = useState("");
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/healthRecordRoutes/viewById/${patientId}`
        );
        const data = await response.json();
        if (response.ok) {
          setPatientData(data);
          setError("");
        } else {
          setError("ไม่พบข้อมูลผู้ป่วย");
          setPatientData(null);
        }
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
        setPatientData(null);
      }
    };
    fetchPatientData();
  }, [patientId]);

  const handleDelete = (recordId) => {
    confirmToast(
      "คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?",
      async () => {
        setLoadingDelete(true);
        try {
          const response = await fetch(
            `${API_URL}/api/healthRecordRoutes/delete/${recordId}`,
            { method: "DELETE" }
          );
          if (response.ok) {
            toast.success("ลบข้อมูลสำเร็จ!");
            navigate("/");
          } else {
            toast.error("เกิดข้อผิดพลาดในการลบข้อมูล");
          }
        } catch (err) {
          toast.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
        } finally {
          setLoadingDelete(false);
        }
      },
      () => {
        toast.info("ยกเลิกการลบข้อมูล");
      }
    );
  };

  return (
    <div className="container">
      <h2>ดูข้อมูลผู้ป่วย</h2>
      {error ? (
        <p className="error">{error}</p>
      ) : patientData ? (
        <PatientInfo
          patient={patientData}
          handleDelete={handleDelete}
          loadingDelete={loadingDelete}
        />
      ) : (
        <p>กำลังโหลดข้อมูล...</p>
      )}
    </div>
  );
};

export default ViewPatient;

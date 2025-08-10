import React from "react";
import Select from "react-select";

const PatientSelector = ({ patients, selectedId, onChange }) => {
  const patientOptions = patients.map((p) => ({
    value: p.Patient_ID,
    label: `${p.P_Name} - ${p.Citizen_ID}`, // แสดงชื่อและเลขบัตร
    P_Name: p.P_Name,
    Citizen_ID: p.Citizen_ID,
  }));

  const selectedOption = patientOptions.find((opt) => opt.value === selectedId);

  return (
    <div className="header-row">
      <Select
        className="patient-select"
        options={patientOptions}
        value={selectedOption}
        onChange={(selected) => onChange(selected.value)}
        placeholder="ค้นหาผู้ป่วย..."
        isSearchable
        noOptionsMessage={() => "ไม่พบชื่อผู้ป่วย"}
        getOptionLabel={(e) => e.label} // ใช้ label ที่ตั้งไว้ข้างบน
        filterOption={(option, inputValue) => {
          // ป้องกันกรณี inputValue เป็น null หรือ undefined
          if (!inputValue) return true;

          const input = inputValue.toLowerCase();
          const { P_Name, Citizen_ID } = option.data || {};

          return (
            (P_Name || "").toLowerCase().includes(input) ||
            (Citizen_ID || "").toLowerCase().includes(input)
          );
        }}
      />
    </div>
  );
};

export default PatientSelector;

import React, { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import axios from 'axios';
import Select from 'react-select';

const PatientSelection = ({ control, errors, handlePatientSelect, patientData, patients: propPatients }) => {
  const [patients, setPatients] = useState(propPatients || []);

  useEffect(() => {
    if (!propPatients) {
      const fetchPatients = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/appointments/patients');
          const formattedPatients = response.data.map(patient => ({
            value: patient.Patient_ID || patient.id,
            label: patient.P_Name || patient.name,
          }));
          setPatients(formattedPatients);
        } catch (error) {
          console.error("Error fetching patients:", error);
        }
      };
      fetchPatients();
    } else {
      const formattedPatients = propPatients.map(patient => ({
        value: patient.Patient_ID || patient.id,
        label: patient.P_Name || patient.name,
      }));
      setPatients(formattedPatients);
    }
  }, [propPatients]);

  const patientOptions = patients.map(patient => ({
    value: patient.Patient_ID || patient.id,
    label: patient.P_Name || patient.name,
  }));

  return (
    <div className="space-y-2">
      <label htmlFor="patientId" className="block text-gray-700 text-sm font-bold mb-2">
        ผู้ป่วย <span className="text-red-500">*</span>
      </label>
      <Controller
        name="patientId"
        control={control}
        rules={{ required: 'กรุณาเลือกผู้ป่วย' }}
        render={({ field }) => (
          <Select
            id="patientId"
            options={patientOptions}
            value={patientOptions.find(option => option.value === field.value)}
            onChange={(selectedOption) => {
              field.onChange(selectedOption ? selectedOption.value : ''); // อัปเดตค่า Field ของ react-hook-form
              handlePatientSelect(selectedOption ? selectedOption.value : null); // เรียก Handler ภายนอก
            }}
            placeholder="ค้นหาหรือเลือกผู้ป่วย..."
            isClearable
          />
        )}
      />
      {errors?.patientId && (
        <p className="text-sm text-red-500">{errors.patientId.message}</p>
      )}
      {patientData && (
        <p className="text-sm text-gray-500">
          ข้อมูลสำหรับ: {patientData.P_Name || patientData.name}
        </p>
      )}
    </div>
  );
};

export default PatientSelection;
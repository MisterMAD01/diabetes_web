import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import PatientSelection from './PatientSelection';
import DateInput from './DateInput';
import FormInput from './FormInput';
import BMIInput from './BMIInput';
import RiskLevelSelect from './RiskLevelSelect';
import axios from 'axios';
import { calculateBMI, calculateRiskLevel, formatDate } from './utils'; // ตรวจสอบ Path อีกครั้ง

const UpdateHealthDataForm = () => {
  const { handleSubmit, control, formState: { errors }, watch, setValue } = useForm();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [bmi, setBmi] = useState(null);
  const [riskLevel, setRiskLevel] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState('');

  const handlePatientSelect = (patientId) => {
    setSelectedPatient(patientId);
    // คุณอาจต้องการดึงข้อมูลผู้ป่วยเพิ่มเติมจาก API ตาม ID ที่เลือก
    // และอัปเดต state patientData ที่นี่ ถ้าจำเป็น
    // ตัวอย่าง:
    // axios.get(`/api/patients/${patientId}`)
    //   .then(response => setPatientData(response.data))
    //   .catch(error => console.error("Error fetching patient data:", error));
  };

  const watchWeight = watch("weight");
  const watchHeight = watch("height");
  const watchBloodSugar = watch("bloodSugar");
  const watchSystolicBP = watch("systolicBP");
  const watchDiastolicBP = watch("diastolicBP");
  const watchWaist = watch("waist");

  useEffect(() => {
    const calculatedBMI = calculateBMI(parseFloat(watchWeight), parseFloat(watchHeight));
    setBmi(calculatedBMI);
    setValue("bmi", calculatedBMI ? calculatedBMI.toFixed(2) : '', { shouldValidate: false });

    if (calculatedBMI && watchBloodSugar && watchSystolicBP && watchDiastolicBP && watchWaist && patientData?.Gender) {
      const calculatedRisk = calculateRiskLevel(
        calculatedBMI,
        parseFloat(watchBloodSugar),
        parseFloat(watchSystolicBP),
        parseFloat(watchDiastolicBP),
        parseFloat(watchWaist),
        patientData.Gender.toLowerCase() // ตรวจสอบว่า patientData ถูกโหลดมาแล้วและมี Gender
      );
      setRiskLevel(calculatedRisk);
      setValue("riskLevel", calculatedRisk, { shouldValidate: false });
    } else {
      setRiskLevel('');
      setValue("riskLevel", '', { shouldValidate: false });
    }
  }, [watchWeight, watchHeight, watchBloodSugar, watchSystolicBP, watchDiastolicBP, watchWaist, patientData?.Gender, setValue]);

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('/api/healthRecordRoutes/add', {
        patientId: data.patientId,
        date: data.date,
        bloodSugar: parseFloat(data.bloodSugar),
        systolicBP: parseInt(data.systolicBP),
        diastolicBP: parseInt(data.diastolicBP),
        weight: parseFloat(data.weight),
        height: parseInt(data.height),
        waist: parseFloat(data.waist),
        bmi: bmi,
        diabetesMellitus: parseInt(data.diabetesMellitus),
        bloodPressure: `${data.systolicBP}/${data.diastolicBP}`,
        smoke: parseInt(data.smoke),
        note: data.note,
        riskLevel: riskLevel,
      });
      console.log("Success:", response.data);
      setSubmissionStatus('บันทึกข้อมูลสำเร็จ!');
      // อาจจะ Redirect หรือ Clear Form ที่นี่
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmissionStatus('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      // แสดงข้อผิดพลาดให้ผู้ใช้ทราบ
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded-md p-6 space-y-4">
      <h3 className="text-lg font-semibold mb-4">กรอกข้อมูลสุขภาพ</h3>

      <PatientSelection
        control={control}
        errors={errors}
        selectedPatient={selectedPatient}
        handlePatientSelect={handlePatientSelect}
        patientData={patientData}
        // propPatients={[]} // คุณสามารถส่ง Array ของผู้ป่วยมาตรงนี้ได้ ถ้ามีอยู่แล้ว
      />

      <DateInput form={{ control, errors }} />

      <FormInput
        control={control}
        name="bloodSugar"
        label="ระดับน้ำตาลในเลือด (mmol/L)"
        placeholder="เช่น 5.5"
        rules={{ required: 'กรุณาระบุระดับน้ำตาลในเลือด', valueAsNumber: true }}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          control={control}
          name="systolicBP"
          label="ความดันโลหิต (ตัวบน)"
          placeholder="เช่น 120"
          rules={{ required: 'กรุณาระบุความดันโลหิตตัวบน', valueAsNumber: true }}
        />
        <FormInput
          control={control}
          name="diastolicBP"
          label="ความดันโลหิต (ตัวล่าง)"
          placeholder="เช่น 80"
          rules={{ required: 'กรุณาระบุความดันโลหิตตัวล่าง', valueAsNumber: true }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          control={control}
          name="weight"
          label="น้ำหนัก (กก.)"
          placeholder="เช่น 70.5"
          rules={{ required: 'กรุณาระบุน้ำหนัก', valueAsNumber: true }}
        />
        <FormInput
          control={control}
          name="height"
          label="ส่วนสูง (ซม.)"
          placeholder="เช่น 170"
          rules={{ required: 'กรุณาระบุส่วนสูง', valueAsNumber: true }}
        />
      </div>

      <FormInput
        control={control}
        name="waist"
        label="รอบเอว (ซม.)"
        placeholder="เช่น 85"
        rules={{ valueAsNumber: true }}
      />

      <BMIInput control={control} bmi={bmi} />
      <RiskLevelSelect control={control} riskLevel={riskLevel} />

      <div className="space-y-2">
        <label htmlFor="diabetesMellitus" className="block text-gray-700 text-sm font-bold mb-2">เบาหวาน</label>
        <Controller
          name="diabetesMellitus"
          control={control}
          render={({ field }) => (
            <select
              id="diabetesMellitus"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              {...field}
            >
              <option value={0}>ไม่เป็น</option>
              <option value={1}>เป็น</option>
            </select>
          )}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="smoke" className="block text-gray-700 text-sm font-bold mb-2">สูบบุหรี่</label>
        <Controller
          name="smoke"
          control={control}
          render={({ field }) => (
            <select
              id="smoke"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              {...field}
            >
              <option value={0}>ไม่สูบ</option>
              <option value={1}>สูบ</option>
            </select>
          )}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="note" className="block text-gray-700 text-sm font-bold mb-2">หมายเหตุ</label>
        <Controller
          name="note"
          control={control}
          render={({ field }) => (
            <textarea
              id="note"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              {...field}
            />
          )}
        />
      </div>

      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        บันทึกข้อมูล
      </button>
      {submissionStatus && <p className="mt-4 text-green-500">{submissionStatus}</p>}
    </form>
  );
};

export default UpdateHealthDataForm;
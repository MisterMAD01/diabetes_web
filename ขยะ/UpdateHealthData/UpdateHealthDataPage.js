import React from 'react';
import UpdateHealthDataForm from '../../components/HealthData/UpdateHealthDataForm';

const UpdateHealthDataPage = () => {
  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <h2 className="text-xl font-semibold mb-6">บันทึกข้อมูลสุขภาพ</h2>
      <UpdateHealthDataForm />
    </div>
  );
};

export default UpdateHealthDataPage;
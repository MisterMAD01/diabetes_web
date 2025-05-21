import React from 'react';
import { Controller } from 'react-hook-form';

const RiskLevelSelect = ({ control, riskLevel }) => (
  <div className="space-y-2">
    <label htmlFor="riskLevel" className="block text-gray-700 text-sm font-bold mb-2">ระดับความเสี่ยง</label>
    <Controller
      name="riskLevel"
      control={control}
      render={({ field }) => (
        <select
          id="riskLevel"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
          value={field.value}
          disabled
        >
          <option value="">เลือกระดับความเสี่ยง</option>
          <option value="Green">เขียว</option>
          <option value="Yellow">เหลือง</option>
          <option value="Orange"></option>
          <option value="Red">แดง</option>
          <option value="Purple">ม่วง</option>
          <option value="Brown">น้ำตาล</option>
          <option value="Black">ดำ</option>
        </select>
      )}
    />
  </div>
);

export default RiskLevelSelect;
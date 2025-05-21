import React from 'react';
import { Controller } from 'react-hook-form';

const BMIInput = ({ control, bmi }) => (
  <div className="space-y-2">
    <label htmlFor="bmi" className="block text-gray-700 text-sm font-bold mb-2">BMI</label>
    <Controller
      name="bmi"
      control={control}
      render={({ field }) => (
        <input
          id="bmi"
          type="number"
          placeholder="เช่น 24.5"
          step="0.01"
          {...field}
          readOnly
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
          value={bmi?.toFixed(2) || ''}
        />
      )}
    />
  </div>
);

export default BMIInput;
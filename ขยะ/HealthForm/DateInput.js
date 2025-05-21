import React from 'react';
import { Controller } from 'react-hook-form';

const DateInput = ({ form }) => {
  const { control, errors } = form;

  return (
    <div className="space-y-2">
      <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">
        วันที่ตรวจสุขภาพ <span className="text-red-500">*</span>
      </label>
      <div>
        <Controller
          name="date"
          control={control}
          rules={{ required: 'กรุณาใส่วันที่ตรวจสุขภาพ' }}
          render={({ field }) => (
            <input
              type="date"
              id="date"
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors?.date ? 'border-red-500' : ''}`}
              {...field}
            />
          )}
        />
        {errors?.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>
    </div>
  );
};

export default DateInput;
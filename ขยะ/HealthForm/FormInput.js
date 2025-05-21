import React from 'react';
import { Controller } from 'react-hook-form';

const FormInput = ({ control, name, label, placeholder, errors, ...props }) => (
  <div className="space-y-2">
    <label htmlFor={name} className="block text-gray-700 text-sm font-bold mb-2">{label}</label>
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <input
          id={name}
          type="number"
          placeholder={placeholder}
          {...field}
          {...props}
          onChange={(e) => field.onChange(parseFloat(e.target.value))}
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors?.[name] ? 'border-red-500' : ''}`}
        />
      )}
    />
    {errors?.[name] && (
      <p className="text-sm text-red-500">{errors[name]?.message}</p>
    )}
  </div>
);

export default FormInput;
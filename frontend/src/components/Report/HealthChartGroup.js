import React from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

dayjs.extend(buddhistEra);
dayjs.locale('th');

const formatDateLabel = (label) => {
  return dayjs(label).format('D MMMM BBBB'); // เช่น 29 มิถุนายน 2568
};

const HealthChartGroup = ({ data }) => (
  <div className="health-charts">

    <div className="chart-box">
      <h4>ระดับน้ำตาลในเลือด</h4>
      <LineChart width={300} height={200} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tickFormatter={(d) => dayjs(d).format('MMM')} />
        <YAxis domain={[100, 160]} />
        <Tooltip labelFormatter={formatDateLabel} />
        <Legend />
        <Line type="monotone" dataKey="sugar" stroke="#9966FF" strokeWidth={2} />
      </LineChart>
    </div>

    <div className="chart-box">
      <h4>ความดันโลหิต</h4>
      <LineChart width={300} height={200} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tickFormatter={(d) => dayjs(d).format('MMM')} />
        <YAxis domain={[60, 160]} />
        <Tooltip labelFormatter={formatDateLabel} />
        <Legend />
        <Line type="monotone" dataKey="systolic" stroke="#FF6384" strokeWidth={2} />
        <Line type="monotone" dataKey="diastolic" stroke="#4BC0C0" strokeWidth={2} />
      </LineChart>
    </div>

    <div className="chart-box">
      <h4>น้ำหนัก</h4>
      <LineChart width={300} height={200} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tickFormatter={(d) => dayjs(d).format('MMM')} />
        <YAxis domain={[60, 80]} />
        <Tooltip labelFormatter={formatDateLabel} />
        <Legend />
        <Line type="monotone" dataKey="weight" stroke="#FF9F40" strokeWidth={2} />
      </LineChart>
    </div>

    <div className="chart-box">
      <h4>รอบเอว</h4>
      <LineChart width={300} height={200} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tickFormatter={(d) => dayjs(d).format('MMM')} />
        <YAxis domain={[80, 100]} />
        <Tooltip labelFormatter={formatDateLabel} />
        <Legend />
        <Line type="monotone" dataKey="waist" stroke="#FFCD56" strokeWidth={2} />
      </LineChart>
    </div>
  </div>
);

export default HealthChartGroup;

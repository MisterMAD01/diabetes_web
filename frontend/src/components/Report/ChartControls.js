import React, { useMemo } from "react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import DatePicker, { registerLocale } from "react-datepicker";
import th from "date-fns/locale/th";
import "react-datepicker/dist/react-datepicker.css";
import "./ChartControls.css";

// ตั้งค่า dayjs ให้รองรับ พ.ศ.
dayjs.extend(buddhistEra);
dayjs.locale("th");
registerLocale("th", th);

// Custom input แสดงเดือนเต็ม พร้อมปี พ.ศ.
const CustomInput = React.forwardRef(({ value, onClick }, ref) => {
  if (!value) {
    return (
      <button
        className="chart-controls__custom-input"
        onClick={onClick}
        ref={ref}
      >
        เลือกเดือน
      </button>
    );
  }
  const parts = value.split(" ");
  let display;
  if (parts.length === 2) {
    const [monthName, yearCE] = parts;
    display = `${monthName} ${parseInt(yearCE, 10) + 543}`;
  } else {
    const yearCE = parts[0];
    display = `${parseInt(yearCE, 10) + 543}`;
  }
  return (
    <button
      className="chart-controls__custom-input"
      onClick={onClick}
      ref={ref}
    >
      {display}
    </button>
  );
});

// Custom input แสดงวันที่เต็ม พร้อมปี พ.ศ.
const CustomDateInputFull = React.forwardRef(
  ({ value, onClick, placeholder }, ref) => {
    if (!value) {
      return (
        <button
          className="chart-controls__custom-input"
          onClick={onClick}
          ref={ref}
        >
          {placeholder || "เลือกวันที่"}
        </button>
      );
    }
    const display = dayjs(value).format("DD MMMM BBBB");
    return (
      <button
        className="chart-controls__custom-input"
        onClick={onClick}
        ref={ref}
      >
        {display}
      </button>
    );
  }
);

// Custom header แสดงปี พ.ศ. บนปฏิทิน
const renderBEHeader = ({
  date,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
}) => {
  const beYear = dayjs(date).year() + 543;
  return (
    <div className="react-datepicker__header-custom">
      <button
        type="button"
        className="react-datepicker__nav-button react-datepicker__nav-button--previous"
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
      >
        ‹
      </button>
      <span className="react-datepicker__current-month">{beYear}</span>
      <button
        type="button"
        className="react-datepicker__nav-button react-datepicker__nav-button--next"
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
      >
        ›
      </button>
    </div>
  );
};

const ChartControls = ({
  filterType,
  setFilterType,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  customRange,
  setCustomRange,
  chartType,
  setChartType,
}) => {
  const parseDate = (str) => (str ? new Date(str) : null);

  // เดือน
  const monthDate = useMemo(() => parseDate(selectedMonth), [selectedMonth]);
  const onMonthChange = (date) => {
    if (!date) return setSelectedMonth("");
    const ceYear = dayjs(date).year().toString();
    const month = dayjs(date).format("MM");
    setSelectedMonth(`${ceYear}-${month}`);
  };

  // ปี (สร้างลิสต์ปี พ.ศ. ให้เลือก)
  const currentBE = dayjs().year() + 543;
  const START_BE = currentBE - 10;
  const END_BE = currentBE + 5;
  const beYears = Array.from(
    { length: END_BE - START_BE + 1 },
    (_, i) => START_BE + i
  );
  const selectedBEYear = selectedYear ? parseInt(selectedYear, 10) + 543 : "";

  // ช่วงกำหนดเอง
  const onCustomChange = (field) => (date) => {
    if (!date) return setCustomRange((prev) => ({ ...prev, [field]: "" }));
    setCustomRange((prev) => ({
      ...prev,
      [field]: dayjs(date).format("YYYY-MM-DD"),
    }));
  };
  const customFrom = parseDate(customRange.from);
  const customTo = parseDate(customRange.to);
  const isCustomInvalid =
    customRange.from &&
    customRange.to &&
    dayjs(customRange.from).isAfter(dayjs(customRange.to));

  return (
    <div className="chart-controls">
      <div className="chart-controls__filter-section">
        <label>เลือกช่วงเวลา:</label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="month">รายเดือน</option>
          <option value="year">รายปี</option>
          <option value="custom">กำหนดเอง</option>
        </select>

        {filterType === "month" && (
          <>
            <label>เดือน พ.ศ.:</label>
            <DatePicker
              selected={monthDate}
              onChange={onMonthChange}
              dateFormat="MMMM yyyy"
              showMonthYearPicker
              locale="th"
              placeholderText="เลือกเดือน"
              customInput={<CustomInput />}
              renderCustomHeader={renderBEHeader}
            />
          </>
        )}

        {filterType === "year" && (
          <>
            <label>ปี พ.ศ.:</label>
            <select
              className="chart-controls__custom-input"
              value={selectedBEYear}
              onChange={(e) =>
                setSelectedYear((parseInt(e.target.value, 10) - 543).toString())
              }
            >
              <option value="">เลือกปี</option>
              {beYears.map((be) => (
                <option key={be} value={be}>
                  {be}
                </option>
              ))}
            </select>
          </>
        )}

        {filterType === "custom" && (
          <>
            <label>จาก (พ.ศ.)</label>
            <DatePicker
              selected={customFrom}
              onChange={onCustomChange("from")}
              dateFormat="yyyy-MM-dd"
              locale="th"
              placeholderText="เริ่มต้น"
              customInput={<CustomDateInputFull placeholder="เริ่มต้น" />}
            />
            <label>ถึง (พ.ศ.)</label>
            <DatePicker
              selected={customTo}
              onChange={onCustomChange("to")}
              dateFormat="yyyy-MM-dd"
              locale="th"
              placeholderText="สิ้นสุด"
              customInput={<CustomDateInputFull placeholder="สิ้นสุด" />}
            />
            {isCustomInvalid && (
              <p className="chart-controls__error-text">ช่วงวันที่ไม่ถูกต้อง</p>
            )}
          </>
        )}
      </div>

      <div className="chart-controls__type-toggle">
        <label>ประเภทกราฟ:</label>
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          disabled={filterType === "custom" && isCustomInvalid}
        >
          <option value="line">เส้น</option>
          <option value="bar">แท่ง</option>
        </select>
      </div>
    </div>
  );
};

export default ChartControls;

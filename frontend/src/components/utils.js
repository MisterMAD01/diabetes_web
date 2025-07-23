// ปรับวันที่ให้เป็นเวลาไทย (UTC+7)
export const toThaiDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  date.setHours(date.getHours() + 7); // บวกเพิ่ม 7 ชั่วโมงให้เป็นเวลาไทย
  return date;
};

// แปลงวันที่เป็นสตริงรูปแบบไทย เช่น "1 มกราคม 2566"
export const formatDateThai = (dateStr) => {
  const localDate = toThaiDate(dateStr);
  if (!localDate) return "-";
  return localDate.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// แสดงเวลาแบบ "09:00 น." (ตัดเอาเฉพาะ HH:mm)
export const formatTimeThai = (timeStr) => {
  if (!timeStr) return "-";
  return `${timeStr.slice(0, 5)} น.`;
};

// ดึงวันที่ในรูปแบบ ISO yyyy-MM-dd โดยแปลงเป็นเวลาไทยก่อน
export const getLocalISODate = (dateStr) => {
  const date = toThaiDate(dateStr);
  return date.toISOString().split("T")[0];
};

// แปลงวันที่เป็นรูปแบบสั้น dd/MM/yyyy (ปี พ.ศ.)
export function formatDateShortThai(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date)) return "";

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear() + 543; // เปลี่ยน ค.ศ. เป็น พ.ศ.

  return `${day}/${month}/${year}`;
}

// แปลงวันที่ให้ใช้กับ input[type="date"] (yyyy-MM-dd) โดยปรับเป็นเวลาท้องถิ่นก่อน
export const toDateInputValue = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[0];
};
// ฟังก์ชันใหม่ แปลงวันที่ string ให้เป็น Date object เวลาไทยแบบตรง ๆ
export const parseThaiDateNew = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr + "T00:00:00");
};

// ฟังก์ชันใหม่ แปลงวันที่เป็นสตริงแบบไทย
export const formatDateThaiNew = (dateStr) => {
  if (!dateStr) return "-";

  // แปลงให้เป็น ISO format ถ้ามีช่องว่างระหว่างวันที่กับเวลา
  const isoStr = dateStr.includes(" ") ? dateStr.replace(" ", "T") : dateStr;

  const date = new Date(isoStr);
  if (isNaN(date)) return "-";

  const thaiMonths = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543;

  return `${day} ${month} ${year}`;
};

export const formatTimeThai1 = (dateStr) => {
  if (!dateStr) return "-";

  // ถ้าเป็นรูปแบบที่มี space ตรงกลาง ให้แปลงเป็น T
  const isoStr = dateStr.includes(" ") ? dateStr.replace(" ", "T") : dateStr;

  const date = new Date(isoStr);
  if (isNaN(date)) return "-";

  return (
    date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }) + " น."
  );
};

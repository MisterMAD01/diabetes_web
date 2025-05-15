// C:\Users\masen\OneDrive\Desktop\PROJECT END\Coding\diabetes\frontend\src\components\utils.js

// ปรับวันที่ให้เป็นเวลาไทย (UTC+7)
export const toThaiDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    date.setHours(date.getHours() + 7); // แปลงเป็นเขตเวลาไทย
    return date;
  };
  

  

  // แปลงเป็นวันที่ภาษาไทย
  export const formatDateThai = (dateStr) => {
    const localDate = toThaiDate(dateStr);
    if (!localDate) return '-';
    return localDate.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };
  
  // แสดงเวลาแบบ 09:00 น.
  export const formatTimeThai = (timeStr) => {
    if (!timeStr) return '-';
    return `${timeStr.slice(0, 5)} น.`;
  };
  
  // ดึงวันที่ในรูปแบบ yyyy-MM-dd
  export const getLocalISODate = (dateStr) => {
    const date = toThaiDate(dateStr);
    return date.toISOString().split('T')[0];
  };
  
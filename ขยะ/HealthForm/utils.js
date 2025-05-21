const mockPatients = [
    { id: '1', name: 'สมชาย แข็งแรง' },
    { id: '2', name: 'สมหญิง สุขภาพดี' },
    { id: '3', name: 'สมใจ ใจดี' },
  ];
  
  const calculateBMI = (weight, height) => {
    const parsedWeight = parseFloat(weight);
    const parsedHeight = parseFloat(height);
  
    if (isNaN(parsedWeight) || isNaN(parsedHeight) || parsedHeight <= 0) {
      return undefined;
    }
  
    const heightInMeters = parsedHeight / 100;
    return parseFloat((parsedWeight / (heightInMeters * heightInMeters)).toFixed(2));
  };
  
  const calculateRiskLevel = (bmi, bloodSugar, systolicBP, diastolicBP, waist, gender) => {
    let score = 0;
  
    if (bmi) {
      if (bmi >= 23 && bmi < 25) score += 1;
      else if (bmi >= 25 && bmi < 30) score += 3;
      else if (bmi >= 30) score += 5;
    }
  
    if (bloodSugar && bloodSugar > (100 / 18)) score += 2;
  
    if (systolicBP && systolicBP >= 130) score += 2;
    if (diastolicBP && diastolicBP >= 85) score += 2;
  
    if (waist) {
      if (gender === 'male' && waist > 90) score += 2;
      else if (gender === 'female' && waist > 80) score += 2;
    }
  
    let level;
    if (score <= 2) level = "Green";
    else if (score <= 4) level = "Yellow";
    else if (score <= 6) level = "Orange";
    else if (score <= 8) level = "Red";
    else if (score <= 10) level = "Purple";
    else if (score <= 12) level = "Brown";
    else level = "Black";
  
    return level;
  };
  
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      return '';
    }
  };
  
  const convertMgdlToMmol = (mgdl) => {
    const parsedMgdl = parseFloat(mgdl);
    if (!isNaN(parsedMgdl)) {
      return parseFloat((parsedMgdl / 18).toFixed(2));
    }
    return undefined;
  };
  
  const convertMmolToMgdl = (mmol) => {
    const parsedMmol = parseFloat(mmol);
    if (!isNaN(parsedMmol)) {
      return parseFloat((parsedMmol * 18).toFixed(2));
    }
    return undefined;
  };
  
  export { calculateBMI, calculateRiskLevel, mockPatients, formatDate, convertMgdlToMmol, convertMmolToMgdl };
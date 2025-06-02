import React, { useState, useEffect } from 'react';
import axios from 'axios';

import WhitePopup from '../../components/PopupColor/WhitePopup';
import LightGreenPopup from '../../components/PopupColor/LightGreenPopup';
import DarkGreenPopup from '../../components/PopupColor/DarkGreenPopup';
import YellowPopup from '../../components/PopupColor/YellowPopup';
import OrangePopup from '../../components/PopupColor/OrangePopup';
import RedPopup from '../../components/PopupColor/RedPopup';
import BlackPopup from '../../components/PopupColor/BlackPopup';

import './Riskgroup.css';

const RiskGroup = () => {
  const [popupColor, setPopupColor] = useState(null);
  const [patients, setPatients] = useState([]);
  const [colorCounts, setColorCounts] = useState({});

  const colorGroups = [
    { name: 'สีขาว', bg: '#ffffff', text: '#000000', popup: WhitePopup },
    { name: 'สีเขียวอ่อน', bg: '#72d572', text: '#000000', popup: LightGreenPopup },
    { name: 'สีเขียวเข้ม', bg: '#056f00', text: '#ffffff', popup: DarkGreenPopup },
    { name: 'สีเหลือง', bg: '#fdd835', text: '#000000', popup: YellowPopup },
    { name: 'สีส้ม', bg: '#ef6c00', text: '#000000', popup: OrangePopup },
    { name: 'สีแดง', bg: '#c41411', text: '#ffffff', popup: RedPopup },
    { name: 'สีดำ', bg: '#212121', text: '#ffffff', popup: BlackPopup },
  ];

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API}/api/risk/counts`)
      .then(res => {
        const counts = {};
        res.data.forEach(({ color, count }) => {
          counts[color] = count;
        });
        setColorCounts(counts);
      })
      .catch(console.error);
  }, []);

  const openPopup = async (colorName) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API}/api/risk/list/${colorName}`);
      setPatients(res.data);
      setPopupColor(colorName);
    } catch (err) {
      console.error(err);
    }
  };

  const closePopup = () => {
    setPopupColor(null);
    setPatients([]);
  };

  const getPopupComponent = () => {
    const colorObj = colorGroups.find(c => c.name === popupColor);
    if (!colorObj) return null;
    const Component = colorObj.popup;
    return <Component onClose={closePopup} patients={patients} />;
  };

  return (
    <div className="form-container">
      <h2 style={{ textAlign: 'center' }}>กลุ่มผู้ป่วยจำแนกตามเกณฑ์ปิงปองจราจร 7 สี</h2>
      <div className="color-group">
        {colorGroups.map((color, idx) => (
          <div key={idx} className="color-box" onClick={() => openPopup(color.name)}>
            <div className="circle" style={{ backgroundColor: color.bg }}></div>
            <div className="text-area">
              <div className="label">จำนวนผู้ป่วย :</div>
              <div className="count">({colorCounts[color.name] || 0} คน)</div>
            </div>
          </div>
        ))}
      </div>
      {getPopupComponent()}
    </div>
  );
};

export default RiskGroup;

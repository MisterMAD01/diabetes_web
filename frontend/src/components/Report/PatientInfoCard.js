import React from "react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";

dayjs.extend(buddhistEra);
dayjs.locale("th");

const PatientInfoCard = ({ patient }) => (
  <div className="patient-info-header">
    <div className="avatar-box">{patient?.ชื่อ?.charAt(0) || "-"}</div>
    <div className="patient-name-block">
      <h3>{patient.ชื่อ}</h3>
      <p className="hn-text">
        {patient["เลขบัตรประชาชน"] || patient.Citizen_ID || "-"}
      </p>
    </div>
  </div>
);

const PatientDetails = ({ patient }) => (
  <div className="info-left">
    <div className="info-item">
      <i className="fas fa-map-marker-alt"></i> {patient["ที่อยู่"]}
    </div>
    <div className="info-item">
      <i className="fas fa-venus-mars"></i> {patient["เพศ"]}
    </div>
    <div className="info-item">
      <i className="fas fa-birthday-cake"></i> {patient["อายุ"]} ปี
    </div>
    <div className="info-item">
      <i className="fas fa-calendar-alt"></i>{" "}
      {dayjs(patient["วันเกิด"]).format("D MMMM BBBB")}
    </div>
    <div className="info-item">
      <i className="fas fa-phone"></i> {patient["เบอร์"]}
    </div>
  </div>
);

export { PatientInfoCard, PatientDetails };

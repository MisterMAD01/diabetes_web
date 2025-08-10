const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const {
  getLatestPatientData,
  getLatestForExcel,
  getHealthTrends,
  getPatientNames,
  getAllPatientNames,
} = require("../../models/Export/exportModel");

const {
  generateGraphImage,
  generateDualLineGraphImage,
} = require("../../Export/utils/generateGraphs");
const exportDir = path.join(__dirname, "../../Export");

if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);

const fontPath = path.join(__dirname, "../../fonts");

function formatDateTH(date) {
  return new Date(date).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

function formatTrendList(rows, key) {
  return rows
    .map((r) => ({ date: formatDateTH(r.Date_Recorded), value: r[key] }))
    .filter((d) => d.value !== null);
}

exports.exportPDF = async (req, res) => {
  const ids = req.query.id?.split(",").map(Number);
  if (!ids || ids.length === 0)
    return res.status(400).send("Missing patient ID");

  const isSingle = ids.length === 1;

  // แปลงวันที่ในรูปแบบ 20/02/2568
  const date = new Date()
    .toLocaleDateString("th-TH", {
      timeZone: "Asia/Bangkok",
      day: "2-digit", // วันที่เป็น 2 หลัก เช่น 20
      month: "2-digit", // เดือนเป็น 2 หลัก เช่น 02
      year: "numeric", // ปี (พ.ศ.)
    })
    .replace(/\//g, "-");

  const fileName = `${date} ข้อมูลผู้ป่วย ${ids.join(",")}.pdf`;
  const filePath = path.join(exportDir, fileName);

  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(fs.createWriteStream(filePath));
  // ✅ ลงทะเบียนฟอนต์
  doc.registerFont(
    "Sarabun-Regular",
    path.join(fontPath, "Sarabun-Regular.ttf")
  );
  doc.registerFont("Sarabun-Bold", path.join(fontPath, "Sarabun-Bold.ttf"));

  // ✅ ตั้ง default font
  doc.font("Sarabun-Regular");

  // โลโก้มุมซ้าย
  doc.image(path.join(__dirname, "../../Export/assets/Logo.png"), 50, 40, {
    width: 80,
  });

  // หัวเรื่องขวาบน
  doc
    .font("Sarabun-Bold")
    .fontSize(19)
    .text("ใบรายงานผลข้อมูลผู้ป่วย", 350, 50, { align: "left" });

  const leftX = 50;
  doc.font("Sarabun-Regular").fontSize(14);
  doc.fontSize(14);

  // วันที่
  doc.text(
    `วันที่ : ${new Date().toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`,
    leftX,
    125
  );

  // ข้อมูลหน่วยงาน
  doc.text("ชื่อหน่วยงาน : โรงพยาบาลส่งเสริมสุขภาพตำบลโคกเคียน", leftX, 160);
  doc.text(
    "ที่อยู่ : เลขที่ 190 หมู่ที่ 11 ตำบลโคกเคียน อำเภอเมือง จังหวัดนราธิวาส 96200",
    leftX,
    180
  );
  doc.text("โทรศัพท์ : 0987654321", leftX, 200);

  // เว้นบรรทัดก่อนเริ่มตาราง
  doc.moveDown(1.5);

  const latestRaw = await getLatestPatientData(ids);

  const latestMap = new Map();
  for (const row of latestRaw) {
    if (!latestMap.has(row.Patient_ID)) {
      latestMap.set(row.Patient_ID, row);
    }
  }
  const latest = Array.from(latestMap.values());

  // หัวข้อก่อนตาราง
  doc.fontSize(14).text("ตารางสรุปข้อมูลของผู้ป่วยล่าสุด:");
  doc.moveDown(0.2);
  const headers = [
    "HN",
    "ชื่อผู้ป่วย",
    "อายุ",
    "ระดับน้ำตาล  ในเลือด",
    "ความดัน  โลหิต",
    "กลุ่มเสี่ยง",
    "โรคแทรกซ้อน",
    "วันที่บันทึก",
  ];
  const colWidths = [35, 90, 35, 85, 70, 65, 60, 85];
  // รวม = 525 px

  const startX = 50;
  let y = doc.y;

  // คำนวณความสูงแต่ละหัว
  const headerHeights = headers.map((h, i) =>
    doc.heightOfString(h, {
      width: colWidths[i],
      align: "center",
    })
  );
  const maxHeight = Math.max(...headerHeights) + 10; // เพิ่ม padding

  // 2️⃣ วาดหัวตารางพร้อมพื้นหลัง
  headers.forEach((h, i) => {
    const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);

    // 🔷 สีพื้นหลังหัวตาราง
    doc.fillColor("#D9D9D9").rect(x, y, colWidths[i], maxHeight).fill();

    // 🔲 ขอบเส้น
    doc.strokeColor("black").rect(x, y, colWidths[i], maxHeight).stroke();

    // 📝 ข้อความหัวตาราง
    doc.fillColor("black").text(h, x, y + 5, {
      width: colWidths[i],
      align: "center",
    });
  });

  y += maxHeight; // ใช้ y ต่อสำหรับวาดข้อมูล
  latest.forEach((p) => {
    const pressure =
      p.Systolic_BP && p.Diastolic_BP
        ? `${p.Systolic_BP}/${p.Diastolic_BP}`
        : "-";

    const row = [
      p.Patient_ID,
      p.P_Name || "-",
      p.Age || "-",
      p.Blood_Sugar ?? "-",
      pressure,
      p.Risk_Level || "-",
      p.Risk_Percentage != null ? `${p.Risk_Percentage}%` : "-",
      p.Date_Recorded
        ? `${formatDateTH(p.Date_Recorded)} ${new Date(
            p.Date_Recorded
          ).toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })} น.`
        : "-",
    ];

    // 🧠 คำนวณความสูงแต่ละช่อง
    const rowHeights = row.map((val, i) =>
      doc.heightOfString(val.toString(), {
        width: colWidths[i],
        align: "center",
      })
    );
    const maxRowHeight = Math.max(...rowHeights) + 10; // padding 5px บน-ล่าง

    row.forEach((val, i) => {
      const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);

      // 🔲 กรอบเซลล์
      doc.rect(x, y, colWidths[i], maxRowHeight).stroke();

      // 📝 ข้อความ (ขึ้นบรรทัดใหม่ได้)
      doc.text(val.toString(), x, y + 5, {
        width: colWidths[i],
        align: "center",
      });
    });

    y += maxRowHeight;
  });

  // Graphs (ในหน้าเดียวกัน)
  if (isSingle) {
    const trends = await getHealthTrends(ids[0]);
    const trendFormatted = {
      bloodSugar: formatTrendList(trends, "Blood_Sugar"),
      weight: formatTrendList(trends, "Weight"),
      pressure: {
        systolic: formatTrendList(trends, "Systolic_BP"),
        diastolic: formatTrendList(trends, "Diastolic_BP"),
      },
      waist: formatTrendList(trends, "Waist"),
    };

    const graphs = await Promise.all([
      generateGraphImage(
        ids[0],
        trendFormatted.bloodSugar,
        "น้ำตาลในเลือด",
        "blood"
      ),
      generateGraphImage(ids[0], trendFormatted.weight, "น้ำหนัก", "weight"),
      generateDualLineGraphImage(
        ids[0],
        trendFormatted.pressure.systolic,
        trendFormatted.pressure.diastolic,
        "pressure"
      ),
      generateGraphImage(ids[0], trendFormatted.waist, "รอบเอว", "waist"),
    ]);

    doc.moveDown(2);
    const pageWidth = doc.page.width;
    const margin = doc.page.margins.left; // สมมุติ 40

    doc.fontSize(16).text("แนวโน้มสุขภาพ", margin, doc.y, {
      width: pageWidth - margin * 2,
      align: "center",
    });
    doc.moveDown(0.5);

    const x1 = 60,
      x2 = 330;
    const yGraph1 = doc.y;
    const yGraph2 = yGraph1 + 220;

    doc.image(graphs[0], x1, yGraph1, { width: 250 });
    doc.image(graphs[1], x2, yGraph1, { width: 250 });
    doc.image(graphs[2], x1, yGraph2, { width: 250 });
    doc.image(graphs[3], x2, yGraph2, { width: 250 });
  }

  doc.end();
  setTimeout(() => res.download(filePath), 600);
};

exports.exportExcel = async (req, res) => {
  const ids = req.query.ids?.split(",").map(Number);
  if (!ids || ids.length === 0) {
    return res.status(400).send("Missing patient IDs");
  }

  try {
    // ดึงข้อมูลผู้ป่วยจากฐานข้อมูล
    const rows = await getLatestForExcel(ids);
    if (!rows.length) {
      return res.status(404).send("No data found");
    }

    // แปลงข้อมูลเป็นภาษาไทยและเพิ่มเลขบัตรประชาชน
    const formattedRows = rows.map((row) => ({
      เลขบัตรประจำตัวประชาชน: row.Citizen_ID,
      ชื่อ: row.P_Name,
      อายุ: row.Age,
      น้ำตาลในเลือด: row.Blood_Sugar,
      ความดันโลหิต: row.Blood_Pressure,
      น้ำหนัก: row.Weight,
      รอบเอว: row.Waist,
      โอกาสการเกิดโรคแทรกซ้อน:
        row.Risk_Percentage != null ? `${row.Risk_Percentage}%` : "-",
      กลุ่มเสี่ยง: row.Risk_Level,
      วันที่บันทึกข้อมูล: new Date(row.Date_Recorded).toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    }));

    // สร้าง Worksheet จากข้อมูล
    const ws = XLSX.utils.json_to_sheet(formattedRows, {
      header: [
        "เลขบัตรประจำตัวประชาชน",
        "ชื่อ",
        "อายุ",
        "น้ำตาลในเลือด",
        "ความดันโลหิต",
        "น้ำหนัก",
        "รอบเอว",
        "โอกาสการเกิดโรคแทรกซ้อน",
        "กลุ่มเสี่ยง",
        "วันที่บันทึกข้อมูล",
      ],
    });

    // ปรับหัวคอลัมน์ให้มีพื้นหลังสีเทา
    for (let col = 0; col < 10; col++) {
      const headerCell = ws[XLSX.utils.encode_cell({ r: 0, c: col })];
      if (headerCell) {
        headerCell.s = {
          fill: { fgColor: { rgb: "D9D9D9" } },
          font: { bold: true, color: { rgb: "000000" } },
          alignment: { vertical: "center", horizontal: "center" },
        };
      }
    }

    // ปรับความกว้างคอลัมน์อัตโนมัติ
    const colWidths = Object.keys(formattedRows[0]).map((header) => {
      const maxLength = Math.max(
        header.length,
        ...formattedRows.map((row) => row[header]?.toString().length || 0)
      );
      return { wch: maxLength + 2 };
    });
    ws["!cols"] = colWidths;

    // จัดแนวข้อมูลตรงกลางในแนวตั้ง
    for (let rowIdx = 1; rowIdx <= formattedRows.length; rowIdx++) {
      for (let colIdx = 0; colIdx < 10; colIdx++) {
        const cell = ws[XLSX.utils.encode_cell({ r: rowIdx, c: colIdx })];
        if (cell) {
          cell.s = { alignment: { vertical: "center" } };
        }
      }
    }

    // สร้าง Workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ข้อมูลผู้ป่วย");

    // ตั้งชื่อไฟล์เป็นวันที่ปัจจุบันและ ID ผู้ป่วย
    const date = new Date()
      .toLocaleDateString("th-TH", {
        timeZone: "Asia/Bangkok",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");
    const fileName = `${date} ข้อมูลผู้ป่วย ${ids.join(",")}.xlsx`;
    const filePath = path.join(exportDir, fileName);

    // เขียนไฟล์
    XLSX.writeFile(wb, filePath);

    // ส่งให้ดาวน์โหลด
    res.download(filePath);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating Excel file");
  }
};

exports.getPreviewNames = async (req, res) => {
  const ids = req.query.ids?.split(",").map(Number);
  if (!ids || ids.length === 0)
    return res.status(400).send("Missing patient IDs");

  try {
    const names = await getPatientNames(ids);
    res.json(names);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ไม่สามารถดึงชื่อผู้ป่วยได้" });
  }
};

exports.getAllPatients = async (req, res) => {
  try {
    const rows = await getAllPatientNames();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ไม่สามารถโหลดรายชื่อผู้ป่วยทั้งหมดได้" });
  }
};

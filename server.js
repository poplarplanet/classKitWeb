// const express = require("express");
// const cors = require("cors");
// const ExcelJS = require("exceljs");
// const path = require("path");

// const app = express();
// const PORT = process.env.PORT || 4000;

// app.use(cors()); // ✅ CORS 허용
// app.use(express.json());

// const XLSX_FILE_PATH = path.join(__dirname, "students.xlsx");

// // 🔹 최신 XLSX 파일을 JSON으로 변환하는 함수 (기존 로직 유지)
// async function readExcelFile() {
//     try {
//         const workbook = new ExcelJS.Workbook();
//         await workbook.xlsx.readFile(XLSX_FILE_PATH);
//         const worksheet = workbook.getWorksheet(1);

//         let students = [];
//         worksheet.eachRow((row, rowNumber) => {
//             if (rowNumber === 1) return; // 첫 번째 행(헤더) 제외
//             let rowData = {
//                 "수업 이름": row.getCell(1).value,
//                 "담당 선생님": row.getCell(2).value,
//                 "학생 이름": row.getCell(3).value,
//                 "수업 일자": new Date(row.getCell(4).value).toISOString().split("T")[0],
//                 "어휘 테스트": row.getCell(5).value,
//                 "과제 평가": row.getCell(6).value,
//                 "수업 태도": row.getCell(7).value,
//             };
//             students.push(rowData);
//         });

//         return students;
//     } catch (error) {
//         console.error("❌ Excel 파일 읽기 실패:", error);
//         return [];
//     }
// }

// // 🔹 API 엔드포인트: 학생 데이터 제공 (기존 로직 유지)
// app.get("/students", async (req, res) => {
//     const students = await readExcelFile();
//     res.json(students);
// });

// // 🔹 서버 실행 (Render에서 실행)
// app.listen(PORT, () => console.log(`✅ Server running on https://classkitweb.onrender.com`));

const express = require("express");
const cors = require("cors");
const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT;  // ✅ Render에서 제공하는 PORT 강제 사용

if (!PORT) {
    console.error("❌ 환경 변수 PORT가 설정되지 않았습니다. 서버를 종료합니다.");
    process.exit(1);
}

app.use(cors()); // ✅ CORS 허용
app.use(express.json());

const XLSX_FILE_PATH = path.join(__dirname, "students.xlsx");

const GOOGLE_DRIVE_FILE_ID = "1QgAymweqcE-QqVQyoDBlrVWL2N3p-kGS";  
const GOOGLE_DRIVE_DOWNLOAD_URL = `https://drive.google.com/uc?export=download&id=${GOOGLE_DRIVE_FILE_ID}`;

// 🔹 Google Drive에서 최신 Excel 다운로드
async function downloadLatestExcel() {
    try {
        console.log("📢 Google Drive에서 최신 XLSX 파일 다운로드 중...");
        const response = await axios({
            url: GOOGLE_DRIVE_DOWNLOAD_URL,
            method: "GET",
            responseType: "arraybuffer",
        });

        if (fs.existsSync(XLSX_FILE_PATH)) {
            fs.unlinkSync(XLSX_FILE_PATH);
        }

        fs.writeFileSync(XLSX_FILE_PATH, response.data);
        console.log("✅ 최신 XLSX 파일 다운로드 완료.");
    } catch (error) {
        console.error("❌ XLSX 파일 다운로드 오류 발생:", error);
    }
}

// 🔹 Excel 데이터를 JSON으로 변환
async function readExcelFile() {
    try {
        if (!fs.existsSync(XLSX_FILE_PATH)) {
            console.error("❌ Excel 파일이 존재하지 않습니다.");
            return [];
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(XLSX_FILE_PATH);
        const worksheet = workbook.getWorksheet(1);

        let students = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;
            let rowData = {
                "수업 이름": row.getCell(1).value,
                "담당 선생님": row.getCell(2).value,
                "학생 이름": row.getCell(3).value,
                "수업 일자": new Date(row.getCell(4).value).toISOString().split("T")[0],
                "어휘 테스트": row.getCell(5).value,
                "과제 평가": row.getCell(6).value,
                "수업 태도": row.getCell(7).value,
            };
            students.push(rowData);
        });

        return students;
    } catch (error) {
        console.error("❌ Excel 파일 읽기 실패:", error);
        return [];
    }
}

// ✅ 서버 시작 시 최신 데이터 다운로드
downloadLatestExcel();

// 🔹 5분마다 최신 Excel 데이터 자동 업데이트
setInterval(async () => {
    console.log("🔄 5분마다 최신 XLSX 데이터 업데이트 중...");
    await downloadLatestExcel();
}, 5 * 60 * 1000);

// 🔹 API 엔드포인트: 학생 데이터 제공
app.get("/students", async (req, res) => {
    const students = await readExcelFile();
    res.json(students);
});

// 🔹 서버 실행 (Render에서 실행)
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

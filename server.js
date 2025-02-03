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
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const XLSX_FILE_PATH = path.join(__dirname, "students.xlsx");

// ✅ Google Drive 파일 정보
const GOOGLE_DRIVE_FILE_ID = "1QgAymweqcE-QqVQyoDBlrVWL2N3p-kGS"; // ✅ Google Drive 파일 ID 수정 필요
const GOOGLE_DRIVE_DOWNLOAD_URL = `https://drive.google.com/uc?export=download&id=${GOOGLE_DRIVE_FILE_ID}`;

let lastModifiedTime = null;

// ✅ Google Drive에서 파일 다운로드 함수
async function downloadLatestExcel(forceUpdate = false) {
    try {
        if (!forceUpdate && fs.existsSync(XLSX_FILE_PATH)) {
            console.log("✅ 기존 students.xlsx 파일이 존재하므로 다운로드하지 않음.");
            return;
        }

        console.log("📢 Google Drive에서 최신 XLSX 파일 다운로드 중...");

        const response = await axios({
            url: GOOGLE_DRIVE_DOWNLOAD_URL,
            method: "GET",
            responseType: "arraybuffer",
        });

        // ✅ 기존 파일 삭제 후 새로운 파일 저장
        if (fs.existsSync(XLSX_FILE_PATH)) {
            fs.unlinkSync(XLSX_FILE_PATH);
        }
        fs.writeFileSync(XLSX_FILE_PATH, response.data);
        console.log("✅ 최신 XLSX 파일 다운로드 완료.");
    } catch (error) {
        console.error("❌ XLSX 파일 다운로드 오류 발생:", error);
    }
}

// ✅ 서버 시작 시 파일이 없으면 강제 다운로드
async function ensureFileExists() {
    if (!fs.existsSync(XLSX_FILE_PATH)) {
        console.log("❌ students.xlsx 파일이 없음! 다운로드 시작...");
        await downloadLatestExcel(true);
    }
}
ensureFileExists();

// ✅ 1분마다 최신 파일 업데이트 확인
setInterval(async () => {
    console.log("🔄 1분마다 최신 XLSX 데이터 확인 중...");
    await downloadLatestExcel(true);
}, 60 * 1000); // 1분마다 실행

// ✅ Excel 파일을 JSON으로 변환하는 함수
async function readExcelFile() {
    try {
        await ensureFileExists(); // 🔹 파일이 없으면 강제 다운로드

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(XLSX_FILE_PATH);
        const worksheet = workbook.getWorksheet(1);

        if (!worksheet) {
            throw new Error("❌ Excel 파일이 비어 있거나, 잘못된 형식입니다.");
        }

        let students = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;
            let rowData = {
                "수업 이름": row.getCell(1).value || "",
                "담당 선생님": row.getCell(2).value || "",
                "학생 이름": row.getCell(3).value || "",
                "수업 일자": row.getCell(4).value
                    ? new Date(row.getCell(4).value).toISOString().split("T")[0]
                    : "",
                "어휘 테스트": row.getCell(5).value || 0,
                "과제 평가": row.getCell(6).value || 0,
                "수업 태도": row.getCell(7).value || 0,
            };
            students.push(rowData);
        });

        if (students.length === 0) {
            console.error("❌ Excel 파일이 비어 있음.");
        } else {
            console.log(`✅ 학생 데이터 ${students.length}개 로드 완료.`);
        }

        return students;
    } catch (error) {
        console.error("❌ Excel 파일 읽기 실패:", error);
        return [];
    }
}

// ✅ API 엔드포인트: 학생 데이터 제공
app.get("/students", async (req, res) => {
    console.log("📢 /students 엔드포인트 호출됨.");
    const students = await readExcelFile();
    res.json(students);
});

// ✅ 서버 실행
app.listen(PORT, () => console.log(`✅ Server running on https://classkitweb.onrender.com`));

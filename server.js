const express = require("express");
const cors = require("cors");
const axios = require("axios");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.static("public"));

const XLSX_FILE_PATH = path.join(__dirname, "../students.xlsx");
const TEMP_XLSX_FILE_PATH = path.join(__dirname, "../students_temp.xlsx");

// 🔹 Google Drive 공유 XLSX 파일 다운로드 URL
const GOOGLE_DRIVE_FILE_ID = "1QgAymweqcE-QqVQyoDBlrVWL2N3p-kGS";  
const GOOGLE_DRIVE_DOWNLOAD_URL = `https://drive.google.com/uc?export=download&id=${GOOGLE_DRIVE_FILE_ID}`;

// 🔹 안전한 XLSX 파일 덮어쓰기 방식 적용: 파일 크러쉬 방지용
async function downloadLatestExcel() {
    try {
        console.log("📢 Google Drive에서 최신 XLSX 파일 다운로드 중...");

        const response = await axios({
            url: GOOGLE_DRIVE_DOWNLOAD_URL,
            method: "GET",
            responseType: "arraybuffer",
        });

        // 1️⃣ 먼저 임시 파일(`students_temp.xlsx`)로 저장
        fs.writeFileSync(TEMP_XLSX_FILE_PATH, response.data);

        // 2️⃣ 기존 `students.xlsx` 파일이 존재하면 삭제
        if (fs.existsSync(XLSX_FILE_PATH)) {
            fs.unlinkSync(XLSX_FILE_PATH);
        }

        // 3️⃣ `students_temp.xlsx`를 `students.xlsx`로 이름 변경 (파일 교체)
        fs.renameSync(TEMP_XLSX_FILE_PATH, XLSX_FILE_PATH);

        console.log("✅ 최신 XLSX 파일이 성공적으로 교체되었습니다.");
    } catch (error) {
        console.error("❌ XLSX 파일 다운로드 오류 발생:", error);
    }
}

// 🔹 최신 XLSX 파일을 JSON으로 변환하는 함수
async function readExcelFile() {
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(XLSX_FILE_PATH);
        const worksheet = workbook.getWorksheet(1);

        let students = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // 첫 번째 행(헤더) 제외
            let rowData = {
                "수업 이름": row.getCell(1).value,
                "담당 선생님": row.getCell(2).value,
                "학생 이름": row.getCell(3).value,
                "수업 일자": new Date(row.getCell(4).value).toISOString().split("T")[0], // 날짜만 표시
                "어휘 테스트": row.getCell(5).value,
                "과제 평가": row.getCell(6).value,
                "수업 태도": row.getCell(7).value,
            };
            students.push(rowData);
        });

        return students;
    } catch (error) {
        console.error("❌ Excel 파일을 읽는 데 실패했습니다:", error);
        return [];
    }
}

// 🔹 5초마다 Google Drive에서 최신 파일을 다운로드하여 변경 사항 감지
setInterval(async () => {
    await downloadLatestExcel();
}, 5000);

// 🔹 API 엔드포인트: 최신 학생 데이터를 JSON으로 제공
app.get("/students", async (req, res) => {
    const students = await readExcelFile();
    res.json(students);
});

// 🔹 서버 실행
const PORT = 4000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));

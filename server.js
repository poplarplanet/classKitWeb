const express = require("express");
const cors = require("cors");
const ExcelJS = require("exceljs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors()); // ✅ CORS 허용
app.use(express.json());

const XLSX_FILE_PATH = path.join(__dirname, "students.xlsx");

// 🔹 최신 XLSX 파일을 JSON으로 변환하는 함수 (기존 로직 유지)
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

// 🔹 API 엔드포인트: 학생 데이터 제공 (기존 로직 유지)
app.get("/students", async (req, res) => {
    const students = await readExcelFile();
    res.json(students);
});

// 🔹 서버 실행 (Render에서 실행)
app.listen(PORT, () => console.log(`✅ Server running on https://classkitweb.onrender.com`));

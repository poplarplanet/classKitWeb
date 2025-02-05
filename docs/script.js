document.addEventListener("DOMContentLoaded", async function () {
    const classSelect = document.getElementById("class-select");
    const teacherSelect = document.getElementById("teacher-select");
    const studentSelect = document.getElementById("student-select");
    const selectedDate = document.getElementById("selected-date");
    const prevDateBtn = document.getElementById("prev-date");
    const nextDateBtn = document.getElementById("next-date");

    const vocabTest = document.getElementById("vocab-test");
    const homeworkScore = document.getElementById("homework-score");
    const classAttitude = document.getElementById("class-attitude");

    let students = [];
    let studentRecords = [];
    let currentIndex = 0;

    // ✅ Render 서버의 URL (기존 localhost 대신 사용)
    const API_URL = "https://classkitweb.onrender.com/students";

    const teacherComment = document.getElementById("teacher-comment");
    const generateAiButton = document.getElementById("generate-ai");

    async function loadTeacherComment() {
        if (!classSelect.value || !teacherSelect.value || !studentSelect.value) {
            teacherComment.textContent = "-";
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:4000/comment?className=${classSelect.value}&teacher=${teacherSelect.value}&studentName=${studentSelect.value}`
            );
            const data = await response.json();
            teacherComment.textContent = data.comment;
        } catch (error) {
            console.error("❌ 선생님 코멘트 불러오기 실패:", error);
            teacherComment.textContent = "불러오기 실패";
        }
    }

    studentSelect.addEventListener("change", loadTeacherComment);

    // ✅ AI 자동 생성 버튼 클릭 시 "완성" 출력
    generateAiButton.addEventListener("click", function () {
        teacherComment.textContent = "완성";
    });

    try {
        console.log("📢 서버에 데이터 요청 중:", API_URL);
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`❌ HTTP 오류! 상태 코드: ${response.status}`);

        students = await response.json();
        console.log("✅ 서버에서 받은 데이터:", students);

         // ✅ 수업 이름 드롭다운 목록 추가
        const classSet = new Set(students.map(s => s["수업 이름"]));
        classSet.forEach(cls => {
            const option = document.createElement("option");
            option.value = cls;
            option.textContent = cls;
            classSelect.appendChild(option);
        });
        // ✅ 수업 이름 선택 시 -> 담당 선생님 목록 업데이트
        classSelect.addEventListener("change", function () {
            teacherSelect.innerHTML = '<option value="">선택</option>';
            studentSelect.innerHTML = '<option value="">선택</option>';
            teacherSelect.disabled = false;
            studentSelect.disabled = true;

            const filteredTeachers = new Set(
                students.filter(s => s["수업 이름"] === classSelect.value)
                        .map(s => s["담당 선생님"])
            );

            filteredTeachers.forEach(teacher => {
                const option = document.createElement("option");
                option.value = teacher;
                option.textContent = teacher;
                teacherSelect.appendChild(option);
            });
        });
        // ✅ 담당 선생님 선택 시 -> 학생 목록 업데이트
        teacherSelect.addEventListener("change", function () {
            studentSelect.innerHTML = '<option value="">선택</option>';
            studentSelect.disabled = false;

            const filteredStudents = new Set(
                students.filter(s => s["수업 이름"] === classSelect.value &&
                                     s["담당 선생님"] === teacherSelect.value)
                        .map(s => s["학생 이름"])
            );

            filteredStudents.forEach(student => {
                const option = document.createElement("option");
                option.value = student;
                option.textContent = student;
                studentSelect.appendChild(option);
            });
        });
        // ✅ 학생 선택 시 -> 해당 학생의 데이터 불러오기
        studentSelect.addEventListener("change", function () {
            studentRecords = students.filter(s =>
                s["수업 이름"] === classSelect.value &&
                s["담당 선생님"] === teacherSelect.value &&
                s["학생 이름"] === studentSelect.value
            );

            if (studentRecords.length > 0) {
                currentIndex = 0;
                updateStudentInfo();
            }
        });

        // ✅ 성적 데이터 업데이트 함수
        function updateStudentInfo() {
            if (studentRecords.length === 0) return;

            const student = studentRecords[currentIndex];
            selectedDate.textContent = student["수업 일자"];
            vocabTest.innerHTML = `<strong>${student["어휘 테스트"]}</strong>`;
            homeworkScore.innerHTML = `<strong>${student["과제 평가"]}</strong>`;
            classAttitude.innerHTML = `<strong>${student["수업 태도"]}</strong>`;

            prevDateBtn.disabled = (currentIndex === 0);
            nextDateBtn.disabled = (currentIndex === studentRecords.length - 1);
        }
        // ✅ 수업 일자 이전 버튼
        prevDateBtn.addEventListener("click", function () {
            if (currentIndex > 0) {
                currentIndex--;
                updateStudentInfo();
            }
        });

        // ✅ 수업 일자 다음 버튼
        nextDateBtn.addEventListener("click", function () {
            if (currentIndex < studentRecords.length - 1) {
                currentIndex++;
                updateStudentInfo();
            }
        });

    } catch (error) {
        console.error("❌ 데이터 불러오기 실패:", error);
    }
});


// document.addEventListener("DOMContentLoaded", async function () {
//     const classSelect = document.getElementById("class-select");
//     const teacherSelect = document.getElementById("teacher-select");
//     const studentSelect = document.getElementById("student-select");
//     const selectedDate = document.getElementById("selected-date");
//     const prevDateBtn = document.getElementById("prev-date");
//     const nextDateBtn = document.getElementById("next-date");

//     const vocabTest = document.getElementById("vocab-test");
//     const homeworkScore = document.getElementById("homework-score");
//     const classAttitude = document.getElementById("class-attitude");

//     let students = [];
//     let studentRecords = [];
//     let currentIndex = 0;

//     try {
//         const response = await fetch("https://classkitweb.onrender.com/students"); // ✅ API URL 변경
//         if (!response.ok) throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);

//         students = await response.json();

//         const classSet = new Set(students.map(s => s["수업 이름"]));
//         classSet.forEach(cls => {
//             const option = document.createElement("option");
//             option.value = cls;
//             option.textContent = cls;
//             classSelect.appendChild(option);
//         });

//         classSelect.addEventListener("change", function () {
//             teacherSelect.innerHTML = '<option value="">선택</option>';
//             studentSelect.innerHTML = '<option value="">선택</option>';
//             teacherSelect.disabled = false;
//             studentSelect.disabled = true;

//             const filteredTeachers = new Set(
//                 students.filter(s => s["수업 이름"] === classSelect.value)
//                         .map(s => s["담당 선생님"])
//             );

//             filteredTeachers.forEach(teacher => {
//                 const option = document.createElement("option");
//                 option.value = teacher;
//                 option.textContent = teacher;
//                 teacherSelect.appendChild(option);
//             });
//         });

//         teacherSelect.addEventListener("change", function () {
//             studentSelect.innerHTML = '<option value="">선택</option>';
//             studentSelect.disabled = false;

//             const filteredStudents = new Set(
//                 students.filter(s => s["수업 이름"] === classSelect.value &&
//                                      s["담당 선생님"] === teacherSelect.value)
//                         .map(s => s["학생 이름"])
//             );

//             filteredStudents.forEach(student => {
//                 const option = document.createElement("option");
//                 option.value = student;
//                 option.textContent = student;
//                 studentSelect.appendChild(option);
//             });
//         });

//         studentSelect.addEventListener("change", function () {
//             studentRecords = students.filter(s =>
//                 s["수업 이름"] === classSelect.value &&
//                 s["담당 선생님"] === teacherSelect.value &&
//                 s["학생 이름"] === studentSelect.value
//             );

//             if (studentRecords.length > 0) {
//                 currentIndex = 0;
//                 updateStudentInfo();
//             }
//         });

//         // ✅ 학생 정보 업데이트 함수 (현재 선택된 수업 일자의 데이터를 보여줌)
//         function updateStudentInfo() {
//             if (studentRecords.length === 0) return;

//             const student = studentRecords[currentIndex];
//             selectedDate.textContent = student["수업 일자"];
//             vocabTest.innerHTML = `<strong>${student["어휘 테스트"]}</strong>`;
//             homeworkScore.innerHTML = `<strong>${student["과제 평가"]}</strong>`;
//             classAttitude.innerHTML = `<strong>${student["수업 태도"]}</strong>`;

//             // ✅ 버튼 활성화/비활성화 처리
//             prevDateBtn.disabled = (currentIndex === 0);
//             nextDateBtn.disabled = (currentIndex === studentRecords.length - 1);
//         }

//         // ✅ ◀ 이전 수업 일자로 이동
//         prevDateBtn.addEventListener("click", function () {
//             if (currentIndex > 0) {
//                 currentIndex--;
//                 updateStudentInfo();
//             }
//         });

//         // ✅ ▶ 다음 수업 일자로 이동
//         nextDateBtn.addEventListener("click", function () {
//             if (currentIndex < studentRecords.length - 1) {
//                 currentIndex++;
//                 updateStudentInfo();
//             }
//         });

//     } catch (error) {
//         console.error("❌ 데이터 불러오기 실패:", error);
//     }
// });

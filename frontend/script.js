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

    try {
        const response = await fetch("http://localhost:4000/students");
        if (!response.ok) throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);

        students = await response.json();

        const classSet = new Set(students.map(s => s["수업 이름"]));
        classSet.forEach(cls => {
            const option = document.createElement("option");
            option.value = cls;
            option.textContent = cls;
            classSelect.appendChild(option);
        });

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

    } catch (error) {
        console.error("데이터 불러오기 실패:", error);
    }
});

document.addEventListener("DOMContentLoaded", function () {
    // Get form and button elements
    const studentForm = document.getElementById("Form");
    const studentRowsButton = document.getElementById("student_rows");
    const studentFormPopup = document.getElementById("student_form_popup");
    const closeStudentFormButton = document.getElementById("close_student_form");
    const studentsContainer = document.getElementById("students_container");
    const nmbStudentsInput = document.getElementById("nmb_students");

    // Student Form Submission Handler
    studentForm.addEventListener("submit", function (event) {
        event.preventDefault();

        // Collect dynamic student objects from the students container
        const studentContainers = document.querySelectorAll("#students_container .student");
        let students = [];

        studentContainers.forEach((container, index) => {
            const name = container.querySelector(`input[name="students[${index + 1}][name]"]`).value;
            const surname = container.querySelector(`input[name="students[${index + 1}][surname]"]`).value;
            const email = container.querySelector(`input[name="students[${index + 1}][email]"]`).value;
            const phone = container.querySelector(`input[name="students[${index + 1}][phone]"]`).value;
            students.push({ name, surname, email, phone });
        });

        // Collect course data
        const courseForm = document.getElementById("course_form");
        const courseFormData = new FormData(courseForm);
        const courseData = {
            group_name: courseFormData.get("group_name"),
            classes: courseFormData.get("classes"),
            nmb_students: courseFormData.get("nmb_students"),
            monday: courseFormData.get("monday"),
            monday_end: courseFormData.get("monday_end"),
            tuesday: courseFormData.get("tuesday"),
            tuesday_end: courseFormData.get("tuesday_end"),
            wednesday: courseFormData.get("wednesday"),
            wednesday_end: courseFormData.get("wednesday_end"),
            thursday: courseFormData.get("thursday"),
            thursday_end: courseFormData.get("thursday_end"),
            friday: courseFormData.get("friday"),
            friday_end: courseFormData.get("friday_end"),
            saturday: courseFormData.get("saturday"),
            saturday_end: courseFormData.get("saturday_end"),
            sunday: courseFormData.get("sunday"),
            sunday_end: courseFormData.get("sunday_end"),
        };

        // Final payload combining course and student info
        const payload = { students, ...courseData };

        fetch(studentForm.action, {
            method: studentForm.method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
        .then(response => {
            console.log("Response status:", response.status);
            return response.text();  // Get raw response
        })
        .then(text => {
            console.log("Raw response:", text);
            try {
                const data = JSON.parse(text);
                console.log("Parsed JSON:", data);
            } catch (error) {
                console.error("JSON parse error:", error);
            }
        })
        .catch(error => console.error("Error submitting form:", error));
    });

    // Function to generate the student table dynamically
    function generateStudentTable(count) {
        studentsContainer.innerHTML = ""; // Clear previous content

        const table = document.createElement("table");
        table.classList.add("student-table");

        const thead = document.createElement("thead");
        thead.innerHTML = `
            <tr>
                <th>#</th>
                <th>სახელი</th>
                <th>გვარი</th>
                <th>Email</th>
                <th>მობილური ნომერი</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement("tbody");

        for (let i = 1; i <= count; i++) {
            const row = document.createElement("tr");
            row.classList.add("student");

            row.innerHTML = `
                <td>${i}</td>
                <td><input type="text" name="students[${i}][name]" placeholder="სახელი" required></td>
                <td><input type="text" name="students[${i}][surname]" placeholder="გვარი" required></td>
                <td><input type="email" name="students[${i}][email]" placeholder="email@gmail.com" required></td>
                <td><input type="tel" name="students[${i}][phone]" placeholder="000 00 00 00" required></td>
            `;
            tbody.appendChild(row);
        }

        table.appendChild(tbody);
        studentsContainer.appendChild(table);
    }

    // Show student form popup when button is clicked
    studentRowsButton.addEventListener("click", function () {
        const count = parseInt(nmbStudentsInput.value, 10);
        if (isNaN(count) || count < 1) {
            alert("გთხოვთ შეიყვანოთ სწორი სტუდენტების რაოდენობა");
            return;
        }

        // Show student form with fade-in animation
        studentFormPopup.style.display = 'block';
        setTimeout(() => studentFormPopup.classList.add('show'), 10);

        generateStudentTable(count); // Generate student table
    });

    // Close student form popup when close button is clicked
    closeStudentFormButton.addEventListener("click", function () {
        studentFormPopup.classList.remove('show');
        setTimeout(() => studentFormPopup.style.display = 'none', 500);
    });
});

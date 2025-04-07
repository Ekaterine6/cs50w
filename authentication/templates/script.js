document.addEventListener("DOMContentLoaded", function () {
    const studentForm = document.getElementById("student_form");
    const studentsContainer = document.getElementById("students_container");
    const studentRowsButton = document.getElementById("student_rows");
    const nmbStudentsInput = document.getElementById("nmb_students");
    const courseForm = document.getElementById("course_form");

    // Handle student form submission
    studentForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent default form submission

        console.log("Student form submitted");

        // Collect student data from dynamically created rows
        const studentContainers = document.querySelectorAll("#students_container .student");
        let students = [];

        studentContainers.forEach((container, index) => {
            const name = container.querySelector(`input[name="students[${index}][name]"]`).value;
            const surname = container.querySelector(`input[name="students[${index}][surname]"]`).value;
            const email = container.querySelector(`input[name="students[${index}][email]"]`).value;
            const phone = container.querySelector(`input[name="students[${index}][phone]"]`).value;

            // Check if any required field is empty
            if (!name || !surname || !email || !phone) {
                alert("Please fill in all fields for each student.");
                return;
            }

            students.push({ name, surname, email, phone });
        });

        // Collect course data (optional, if you also want to collect course data)
        const courseFormData = new FormData(courseForm);
        const courseData = {
            group_name: courseFormData.get("group_name"),
            classes: courseFormData.get("classes"),
            nmb_students: courseFormData.get("nmb_students"),
            // Add other course details here...
        };

        // Final payload combining students and course data
        const payload = { students, ...courseData };

        // Send data to backend
        fetch(studentForm.action, {
            method: studentForm.method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
        .then(response => response.text())
        .then(text => console.log(text)) // Log the server response
        .catch(error => console.error("Error submitting form:", error));
    });

    // Function to dynamically generate student rows based on number input
    studentRowsButton.addEventListener("click", function () {
        const count = parseInt(nmbStudentsInput.value, 10);
        if (isNaN(count) || count < 1) {
            alert("Please enter a valid number of students.");
            return;
        }

        generateStudentTable(count);
    });

    // Function to generate student rows dynamically
    function generateStudentTable(count) {
        studentsContainer.innerHTML = ""; // Clear previous content

        for (let i = 0; i < count; i++) {
            const row = document.createElement("div");
            row.classList.add("student");
            row.innerHTML = `
                <label>სახელი:</label>
                <input type="text" name="students[${i}][name]" required><br>
                <label>გვარი:</label>
                <input type="text" name="students[${i}][surname]" required><br>
                <label>Email:</label>
                <input type="email" name="students[${i}][email]" required><br>
                <label>მობილური ნომერი:</label>
                <input type="tel" name="students[${i}][phone]" required><br>
            `;
            studentsContainer.appendChild(row);
        }
    }

    // Handle course form submission (optional)
    if (courseForm) {
        courseForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const courseFormData = new FormData(courseForm);
            const courseData = {
                group_name: courseFormData.get("group_name"),
                classes: courseFormData.get("classes"),
                nmb_students: courseFormData.get("nmb_students"),
                // Other course fields here...
            };

            fetch(courseForm.action, {
                method: courseForm.method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(courseData)
            })
            .then(response => response.json())
            .then(data => console.log("Course data submitted:", data))
            .catch(error => console.error("Error submitting course form:", error));
        });
    }

});


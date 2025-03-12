document.addEventListener("DOMContentLoaded", function () {
    // Student Form Submission Handler
    const studentForm = document.getElementById("Form");

    studentForm.addEventListener("submit", function (event) {
        event.preventDefault();

        // Collect dynamic student objects from the students container.
        const studentContainers = document.querySelectorAll("#students_container .student");
        let students = [];
        studentContainers.forEach((container, index) => {
            // Using index+1 to match generated field names
            const name = container.querySelector(`input[name="students[${index + 1}][name]"]`).value;
            const surname = container.querySelector(`input[name="students[${index + 1}][surname]"]`).value;
            const email = container.querySelector(`input[name="students[${index + 1}][email]"]`).value;
            const phone = container.querySelector(`input[name="students[${index + 1}][phone]"]`).value;
            students.push({ name, surname, email, phone });
        });

        //getting course data if there is any
        const courseForm = document.getElementById("course_form");
        let courseData = {};
        if (courseForm) {
            const courseFormData = new FormData(courseForm);
            // course inputs
            courseData = {
                classes: courseFormData.get("classes"),
                nmb_students: courseFormData.get("nmb_students"),
        
                monday: courseFormData.get("monday") ? courseFormData.get("monday_time") : '',
                tuesday: courseFormData.get("tuesday") ? courseFormData.get("tuesday_time") : '',
                wednesday: courseFormData.get("wednesday") ? courseFormData.get("wednesday_time") : '',
                thursday: courseFormData.get("thursday") ? courseFormData.get("thursday_time") : '',
                friday: courseFormData.get("friday") ? courseFormData.get("friday_time") : '',
                saturday: courseFormData.get("saturday") ? courseFormData.get("saturday_time") : '',
                sunday: courseFormData.get("sunday") ? courseFormData.get("sunday_time") : '',
            };
        }

        //final payload combining course and student info
        const payload = {
            students,
            ...courseData
        };

        console.log("Submitting the following payload:");
        console.log(payload);

        fetch("/submit-form", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then((response) => response.text())
        .then((data) => {
            console.log("Server response:", data);
            alert("სტუდენტები და კურსის ინფორმაცია დამატებულია");
        })
        .catch((error) => {
            console.error("Error:", error);
        });
    });

    // Dynamic Student Fields Generation
    const nmbStudentsInput = document.getElementById("nmb_students");
    const generateStudentsButton = document.getElementById("student_rows");
    const studentsContainer = document.getElementById("students_container");

    // Function create student input
    function generateStudentFields(count) {
        // Clear
        studentsContainer.innerHTML = "";

        for (let i = 1; i <= count; i++) {
            // Create a container div for each student.
            const studentDiv = document.createElement("div");
            studentDiv.classList.add("student");
            studentDiv.innerHTML = `
                <h4>სტუდენტი ${i}</h4>
                <div class="formss">
                    <label for="name_${i}">სახელი:</label><br>
                    <input id="name_${i}" name="students[${i}][name]" type="text" placeholder="სახელი" required><br>
                </div>
                <div class="formss">
                    <label for="surname_${i}">გვარი:</label><br>
                    <input id="surname_${i}" name="students[${i}][surname]" type="text" placeholder="გვარი" required><br>
                </div>
                <div class="formss">
                    <label for="email_${i}">Email:</label><br>
                    <input id="email_${i}" name="students[${i}][email]" type="email" placeholder="email@gmail.com" required><br>
                </div>
                <div class="formss">
                    <label for="phone_${i}">მობილური ნომერი:</label><br>
                    <input id="phone_${i}" name="students[${i}][phone]" type="tel" placeholder="000 00 00 00" required><br>
                </div>
            `;
            studentsContainer.appendChild(studentDiv);
        }
    }

    // Generate dynamic fields when the button is clicked.
    generateStudentsButton.addEventListener("click", function () {
        const count = parseInt(nmbStudentsInput.value, 10);
        if (isNaN(count) || count < 1) {
            alert("გთხოვთ შეიყვანოთ სწორი სტუდენტების რაოდენობა");
            return res.redirect('/templates/error.html');
        }
        generateStudentFields(count);
    });
});

document.addEventListener("DOMContentLoaded", function () {
    // Existing form submission logic (for student form submission)
    const studentForm = document.getElementById("student_form");

    studentForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const studentContainers = document.querySelectorAll("#student_form .student");
        let students = [];

        studentContainers.forEach((container, index) => {
            const name = container.querySelector(`input[name="students[${index}][name]"]`).value;
            const surname = container.querySelector(`input[name="students[${index}][surname]"]`).value;
            const email = container.querySelector(`input[name="students[${index}][email]"]`).value;
            const phone = container.querySelector(`input[name="students[${index}][phone]"]`).value;

            if (name && surname && email && phone) { // Ensure all fields are filled
                students.push({ name, surname, email, phone });
            }
        });

        const payload = { students };

        // Send form data to backend using fetch
        fetch(studentForm.action, {
            method: studentForm.method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Response:", data);
            alert('Students added successfully');
        })
        .catch(error => {
            console.error("Error submitting form:", error);
            alert('There was an error adding students');
        });
    });

    // Dynamically add student fields when the "Add Student" button is clicked
    const addStudentButton = document.getElementById("add_student_button");

    addStudentButton.addEventListener("click", function () {
        const studentFormContainer = document.getElementById("student_form");
        const studentCount = studentFormContainer.querySelectorAll(".student").length;
        
        // Create a new student form field block
        const newStudentField = document.createElement("div");
        newStudentField.classList.add("student");

        newStudentField.innerHTML = `
            <label>სახელი:</label>
            <input type="text" name="students[${studentCount}][name]" required><br>

            <label>გვარი:</label>
            <input type="text" name="students[${studentCount}][surname]" required><br>

            <label>Email:</label>
            <input type="email" name="students[${studentCount}][email]" required><br>

            <label>მობილური ნომერი:</label>
            <input type="tel" name="students[${studentCount}][phone]" required><br>
        `;

        studentFormContainer.appendChild(newStudentField);
    });

    // Other existing functionalities or logic (example: menu script, etc.)
    // Assuming other functionalities like menu handling or other scripts are still working as expected
    const menuContainer = document.getElementById("menu-container");
    if (menuContainer) {
        const menuScript = document.createElement("script");
        menuScript.src = "/static/menu.js";
        menuContainer.appendChild(menuScript);
    }
});

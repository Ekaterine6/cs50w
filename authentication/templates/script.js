document.addEventListener("DOMContentLoaded", function () {
    // Fetch courses for the "Select Course" dropdown
    fetch('/get-course-list')
        .then(response => response.json())
        .then(courses => {
            const select = document.getElementById('courseSelect');
            select.innerHTML = '<option value="">Select a course</option>';
            courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = course.group_name;
                select.appendChild(option);
            });
        })
        .catch(err => {
            console.error('Failed to load courses', err);
        });

    // Handle form submission for adding a student
    const studentForm = document.getElementById("student_form");
    studentForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const student = {
            name: studentForm.querySelector('input[name="students[0][name]"]').value,
            surname: studentForm.querySelector('input[name="students[0][surname]"]').value,
            email: studentForm.querySelector('input[name="students[0][email]"]').value,
            phone: studentForm.querySelector('input[name="students[0][phone]"]').value,
            course_id: studentForm.querySelector('select[name="course_id"]').value,
        };

        if (!student.name || !student.surname || !student.email || !student.phone || !student.course_id) {
            alert('Please fill out all fields');
            return;
        }

        // Send the student data to the server
        fetch(studentForm.action, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ students: [student] }) // Send the student inside an array
        })
        .then(response => response.json())
        .then(data => {
            alert('Student added successfully');
            studentForm.reset();  // Reset the form after submission
            // Redirect to another page after successful form submission to prevent resubmission prompt
            window.location.href = '/students-list';  // Change this URL to the page you want the user to go after submission
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            alert('There was an error adding the student');
        });
    });
});

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const app = express();

// Parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files and templates
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/templates', express.static(path.join(__dirname, 'templates')));

// MySQL connection configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'ekaterine',
    password: 'Ekaa1616.',
    database: 'authentication_database'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');
});


app.post('/submit-form', (req, res) => {
    const {
        classes,
        nmb_students,
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
        sunday,
        students 
    
    } = req.body;

    // First, insert the course information.
    const courseSql = `
        INSERT INTO courses (classes, nmb_students, monday, tuesday, wednesday, thursday, friday, saturday, sunday)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(courseSql, [
        classes,
        nmb_students,
        monday || '',
        tuesday || '',
        wednesday || '',
        thursday || '',
        friday || '',
        saturday || '',
        sunday || ''
    ], (courseErr, courseResult) => {
        if (courseErr) {
            console.error('Error inserting course:', courseErr);
            return res.redirect('/templates/error.html');
        }

        // Retrieve the inserted course id.
        const courseId = courseResult.insertId;

        // If there are student records provided, perform a bulk insert.
        if (Array.isArray(students) && students.length > 0) {
            const studentSql = `
                INSERT INTO students (course_id, name, surname, email, phone)
                VALUES ?
            `;
            // Build an array of arrays for each student record.
            const studentValues = students.map(student => [
                courseId,
                student.name,
                student.surname,
                student.email,
                student.phone
            ]);
            db.query(studentSql, [studentValues], (studentErr, studentResult) => {
                if (studentErr) {
                    console.error('Error inserting students:', studentErr);
                    return res.redirect('/templates/error.html');
                }
                // shows all courses
                res.redirect('/templates/lists.html');
            });
        } else {
            // If no students complete the request
            res.redirect('/templates/lists.html');
        }
    });
});

app.get('/fetch-courses-data', (req, res) => {
    const sql = `
        SELECT c.id AS course_id,
               c.classes,
               c.nmb_students,
               c.monday,
               c.tuesday,
               c.wednesday,
               c.thursday,
               c.friday,
               c.saturday,
               c.sunday,
               s.id AS student_id,
               s.name,
               s.surname,
               s.email,
               s.phone
        FROM courses c
        LEFT JOIN students s ON c.id = s.course_id
        ORDER BY c.id, s.id
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching courses and students:', err);
            return res.redirect('/error.html');
        }
        res.json(results);
    });
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
}); 

app.get('/error.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'error.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

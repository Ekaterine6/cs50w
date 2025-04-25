const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const session = require('express-session');
require('dotenv').config();
const app = express();

// Initialize Twilio client
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
// If you support form-urlencoded data:
app.use(express.urlencoded({ extended: true }));

// Serve static files and templates
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/templates', express.static(path.join(__dirname, 'templates')));

// Keeping users logged in
app.use(session({
    secret: 'your_session_secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true } // Change secure to true if using HTTPS
}));

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

// Your routes and logic go here...

// Login route (no changes)
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    //retrieving the user from the database
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error.')
        }

        if (results.length === 0) {
            return res.status(400).send('user not found');
        }

        const user = results[0];

        if (password !== user.password) {
            return res.status(400).send('invalid credentials.');
        }

        req.session.userId = user.id;
        res.redirect('/index.html');
    });
});

// Serve the login page as the root route
app.get('/', (req, res) => {
    if (req.session && req.session.userId) {
        // If a user is already logged in, redirect to the index page
        res.redirect('/index.html');
    } else {
        // Otherwise, serve the login page from the templates folder
        res.sendFile(path.join(__dirname, 'templates', 'login.html'));
    }
});

// Separate route for submitting course data
app.post('/submit-course-form', (req, res) => {
    const {
        group_name,
        classes,
        subject,
        monday,
        monday_end,
        tuesday,
        tuesday_end,
        wednesday,
        wednesday_end,
        thursday,
        thursday_end,
        friday,
        friday_end,
        saturday,
        saturday_end,
        sunday,
        sunday_end,
    } = req.body;

    const courseSql = `
        INSERT INTO courses 
        (group_name, classes, subject, monday, monday_end, tuesday, tuesday_end, wednesday, wednesday_end, thursday, thursday_end, friday, friday_end, saturday, saturday_end, sunday, sunday_end)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(courseSql, [
        group_name || null,
        classes,
        subject,
        monday || null,
        monday_end || null,
        tuesday || null,
        tuesday_end || null,
        wednesday || null,
        wednesday_end || null,
        thursday || null,
        thursday_end || null,
        friday || null,
        friday_end || null,
        saturday || null,
        saturday_end || null,
        sunday || null,
        sunday_end || null
    ], (courseErr, courseResult) => {
        if (courseErr) {
            console.error('Error inserting course:', courseErr);
            return res.redirect('/templates/error.html');
        }
        
        // Redirect or respond after successful course creation.
        res.redirect('/templates/lists.html');
    });
});

// Separate route for submitting student data
// Example backend route for student submission
app.post('/submit-student-form', (req, res) => {
    const students = req.body.students;
    const courseId = req.body.course_id;

    // Check if courseId exists
    if (!courseId) {
        return res.status(400).json({ error: 'Course ID is required' });
    }

    // Create an array of promises for each student insertion
    const insertPromises = students.map((student) => {
        const query = `INSERT INTO students (name, surname, email, phone, course_id) VALUES (?, ?, ?, ?, ?)`;
        return new Promise((resolve, reject) => {
            db.query(query, [student.name, student.surname, student.email, student.phone, courseId], (err, result) => {
                if (err) {
                    reject(err); // Reject promise if error occurs
                } else {
                    resolve(result); // Resolve promise when query succeeds
                }
            });
        });
    });

    Promise.all(insertPromises)
    .then(() => {
        console.log('All students added successfully');
        res.redirect('/templates/students.html') // ✅ Correct route to serve student.html
    })
    .catch((err) => {
        console.error('Error inserting students:', err);
        res.status(500).json({ error: 'There was an error adding students' });
    });

});


// Route to fetch courses and students (no changes)
app.get('/fetch-courses-data', (req, res) => {
    const sql = `
        SELECT c.id AS course_id,
               c.group_name,
               c.classes,
               c.subject,
               c.monday,
               c.monday_end,
               c.tuesday,
               c.tuesday_end,
               c.wednesday,
               c.wednesday_end,
               c.thursday,
               c.thursday_end,
               c.friday,
               c.friday_end,
               c.saturday,
               c.saturday_end,
               c.sunday,
               c.sunday_end,
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

app.get('/get-course-list', (req, res) => {
    db.query('SELECT id, group_name, subject FROM courses', (err, results) => {
      if (err) {
        console.error('Error fetching course list:', err);
        return res.status(500).send('Error fetching courses.');
      }
      res.json(results);
    });
  });

  

// Serve the index page (no changes)
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve error page (no changes)
app.get('/error.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'error.html'));
});

// Delete course and student history (no changes)
app.delete('/delete-course-history', (req, res) => {
    const deleteCoursesSql = 'DELETE FROM courses';
    const deleteStudentsSql = 'DELETE FROM students';

    db.query(deleteStudentsSql, (studentErr) => {
        if (studentErr) {
            console.error('Error deleting students:', studentErr);
            return res.json({ success: false });
        }

        db.query(deleteCoursesSql, (courseErr) => {
            if (courseErr) {
                console.error('Error deleting courses:', courseErr);
                return res.json({ success: false });
            }

            res.json({ success: true });
        });
    });
});

app.delete('/delete-student/:id', (req, res) => {
    const studentId = req.params.id;
    const query = 'DELETE FROM students WHERE id = ?';

    db.query(query, [studentId], (error, results) => {  // ✅ FIXED
        if (error) {
            console.error('სტუდენტის წაშლა არ განხორციელდა:', error);
            return res.status(500).send('Server error');
        }
        res.status(200).send('სტუდენტი წაშლილია');
    });
});



// Endpoint for starting a verification (no changes)
app.post('/start-verification', (req, res) => {
    const { email, phone } = req.body;

    // Look up user by email to optionally use the stored phone if needed.
    const query = 'SELECT id, phone FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error.');
        }
        if (results.length === 0) return res.status(404).send('User not found.');

        const user = results[0];
        
        // Safely convert the provided phone and the stored phone to strings and trim them.
        const providedPhone = phone ? String(phone).trim() : "";
        const storedPhone = user.phone ? String(user.phone).trim() : "";
        let recipientPhone = providedPhone || storedPhone;
        
        if (!recipientPhone) {
            return res.status(400).send('No valid phone number provided.');
        }

        // Ensure the provided phone is not the same as your Twilio sending number.
        const twilioNumber = process.env.TWILIO_PHONE_NUMBER ? String(process.env.TWILIO_PHONE_NUMBER).trim() : "";
        if (recipientPhone === twilioNumber) {
            return res.status(400).send("The provided phone number cannot be the sender's number. Please provide a different phone number.");
        }
        
        // Optionally update the user's phone number if a new one is provided.
        if (providedPhone && providedPhone !== storedPhone) {
            const updateQuery = 'UPDATE users SET phone = ? WHERE id = ?';
            db.query(updateQuery, [recipientPhone, user.id], (updateErr) => {
                if (updateErr) {
                    console.error('Error updating phone number:', updateErr);
                    // Continue even if updating fails.
                }
            });
        }
        
        // Start the verification using Twilio Verify.
        client.verify.services(process.env.TWILIO_VERIFY_SERVICE_SID)
            .verifications
            .create({
                to: recipientPhone,
                channel: 'sms'
            })
            .then(verification => {
                console.log('Verification started:', verification.sid);
                // Store the user ID and phone in session for later reference.
                req.session.userId = user.id;
                req.session.phone = recipientPhone;
                res.send({
                    message: 'ვერიფიკაციის კოდი გაგზავნილია.',
                    status: verification.status
                });
            })
            .catch(error => {
                console.error('Error starting verification:', error);
                res.status(500).send('Error starting verification.');
            });
    });
});

// Endpoint for checking the verification code (no changes)
app.post('/check-verification', (req, res) => {
    const { code, newPassword } = req.body; // Expect code and new password from the client

    const userId = req.session.userId;
    const phone = req.session.phone;
    if (!userId || !phone) {
        return res.status(401).send('Session expired. Please request a new code.');
    }

    client.verify.services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks
        .create({
            to: phone,
            code: String(code).trim()
        })
        .then(verification_check => {
            console.log('Verification check status:', verification_check.status);
            if (verification_check.status === 'approved') {
                // If verification is approved, update the user's password.
                const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';
                db.query(updateQuery, [newPassword, userId], (err) => {
                    if (err) {
                        console.error('Error updating password:', err);
                        return res.status(500).send('Database error.');
                    }
                    // Clear session variables after a successful password update.
                    req.session.userId = null;
                    req.session.phone = null;
                    res.send('Password updated successfully!');
                });
            } else {
                res.status(400).send({
                    message: 'Invalid verification code or code expired. Please try again.',
                    status: verification_check.status
                });
            }
        })
        .catch(error => {
            console.error('Error verifying code:', error);
            res.status(500).send('Error verifying code.');
        });
});

app.get('/fetch-courses-data', (req, res) => {
    connection.query('SELECT * FROM courses', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to fetch courses' });
        }
        res.json(results);
    });
});

app.get('/fetch-students-for-course/:courseId', (req, res) => {
    const { courseId } = req.params;

    const query = `
        SELECT students.id, students.name, students.surname, students.email, students.phone
        FROM students
        WHERE students.course_id = ?
    `;

    db.query(query, [courseId], (err, results) => {  // ✅ Correct: using db.query
        if (err) {
            console.error('Error fetching students:', err);
            return res.status(500).json({ error: 'Failed to fetch students' });
        }
        res.json(results);
    });
});

// Get list of all courses (for attendance)
app.get('/attendance/courses', (req, res) => {
    db.query('SELECT id, group_name FROM courses', (err, results) => {
      if (err) return res.status(500).send('Error fetching courses');
      res.json(results);
    });
  });
  
  // Get students + attendance counts for a course
  app.get('/attendance/students/:courseId', (req, res) => {
    const courseId = req.params.courseId;
    const sql = `
      SELECT s.id, s.name, s.surname,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) AS present_count,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) AS absent_count
      FROM students s
      LEFT JOIN attendance a ON s.id = a.student_id AND a.course_id = ?
      WHERE s.course_id = ?
      GROUP BY s.id
    `;
    db.query(sql, [courseId, courseId], (err, results) => {
      if (err) return res.status(500).send('Error fetching students');
      res.json(results);
    });
  });
  
  // Save attendance records
  app.post('/attendance/submit', (req, res) => {
    const records = req.body.records;
    if (!records || !records.length) {
      return res.status(400).json({ error: 'No attendance records provided' });
    }
  
    const values = records.map(r => [r.student_id, r.course_id, r.status]);
  
    const sql = 'INSERT INTO attendance (student_id, course_id, status) VALUES ?';
  
    db.query(sql, [values], (err, result) => {
      if (err) {
        console.error("Error saving attendance:", err);
        return res.status(500).json({ error: 'Failed to save attendance' });
      }
      res.json({ message: 'Attendance saved successfully' });
    });
  });
  


// Port and server start (no changes)
const PORT = process.env.PORT || 10000;  // Ensure you're using process.env.PORT for Render to map the port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

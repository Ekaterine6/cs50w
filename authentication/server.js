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

// Serve static files and templates
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/templates', express.static(path.join(__dirname, 'templates')));


//keeping users logged in
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

  

app.post('/submit-form', (req, res) => {
    const {
        group_name,  // <-- new column for the group name, now at the beginning
        classes,
        nmb_students,
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
        students
    } = req.body;

    const courseSql = `
        INSERT INTO courses 
        (group_name, classes, nmb_students, monday, monday_end, tuesday, tuesday_end, wednesday, wednesday_end, thursday, thursday_end, friday, friday_end, saturday, saturday_end, sunday, sunday_end)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(courseSql, [
        group_name || null,
        classes,
        nmb_students,
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

        // Retrieve the inserted course id.
        const courseId = courseResult.insertId;

        if (Array.isArray(students) && students.length > 0) {
            const studentSql = `
                INSERT INTO students (course_id, name, surname, email, phone)
                VALUES ?
            `;
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
                // Redirect or send a success response.
                res.redirect('/templates/lists.html');
            });
        } else {
            // If no students provided, complete the request.
            res.redirect('/templates/lists.html');
        }
    });
});


app.get('/fetch-courses-data', (req, res) => {
    const sql = `
        SELECT c.id AS course_id,
               c.group_name,
               c.classes,
               c.nmb_students,
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


app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/error.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'error.html'));
});


//  delete course history
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


// Endpoint for starting a verification
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
            message: 'Verification code sent.',
            status: verification.status
          });
        })
        .catch(error => {
          console.error('Error starting verification:', error);
          res.status(500).send('Error starting verification.');
        });
    });
  });
  
  /*
    Endpoint for checking the verification code.
    Once the user enters the code, we verify it using the Verify API.
    If approved, you can then allow the password reset.
  */
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
  

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    
});


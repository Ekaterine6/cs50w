const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const app = express();

app.use(bodyParser.json());
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/templates', express.static(path.join(__dirname, 'templates')));

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
    console.log('Received form submission:', req.body); // Debugging log

    const { name, surname, email, phone } = req.body;
    const sql = 'INSERT INTO user (name, surname, email, phone) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, surname, email, phone], (err, result) => {
        if (err) {
            console.error('Database error:', err); // Debugging log
            res.status(500).send('Server error');
        } else {
            console.log('New record created successfully'); // Debugging log
            res.send('New record created successfully');
        }
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

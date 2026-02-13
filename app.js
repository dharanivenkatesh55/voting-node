const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express(); 

app.use(express.static("public"));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test_voting'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

app.get('/', (req, res) => {
    res.render('index', { error: null, success: null });
});

app.post('/submit', (req, res) => {
    const { name, dob, aadhaar, voting_preference } = req.body;

    if (!name || !dob || !aadhaar || !voting_preference) {
        return res.render('index', { error: 'All fields are required', success: null });
    }

    const sql = `INSERT INTO voters (name, dob, aadhaar, voting_preference)
                 VALUES (?, ?, ?, ?)`;

    db.query(sql, [name, dob, aadhaar, voting_preference], (err) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.render('index', { error: 'Aadhaar already exists', success: null });
            }
            return res.render('index', { error: 'Database error', success: null });
        }

        res.render('index', { error: null, success: 'Voter registered successfully!' });
    });
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

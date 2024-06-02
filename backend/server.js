const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
//const config = require('/config');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');


app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
const path = require('path');

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Catch-all handler to return the React app
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public', 'login.html'));
});
app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public', 'profile.html'));
});
// MySQL connection

const database = require('./database.js')

// Login route
app.post('/login', async (req, res) => {
    const { employeeID, password } = req.body;
  
    database.query(
      'SELECT * FROM employee_login WHERE employeeID = ?',
      [employeeID],
      async (err, result) => {
        if (err) {
          res.status(500).json({ error: 'Internal server error' });
        } else if (result.length === 0) {
          res.status(401).json({ error: 'Invalid employeeID or password' });
        } else {
          const isPasswordValid = await bcrypt.compare(password, result[0].password);
          if (isPasswordValid) {
            const token = jwt.sign({ employeeID: result[0].employeeID }, 'your_secret_key', { expiresIn: '1h' });
            res.json({ token, redirectTo: '/profile' });
        } else {
            res.status(401).json({ error: 'Invalid employee_id or password' });
          }
        }
      }
    );
  });

/*const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;
app.use(express.static('public'));

//redirection trial - to signin.php
const { spawn } = require('child_process');
const path = require('path');
app.get('/signin.php', (req, res) => {
    const phpPath = '/opt/lampp/bin/php-cgi'; // Replace 'full/path/to/php-cgi' with the actual path to php-cgi
    const phpScriptPath = path.join(__dirname, 'signin.php');
    
    const php = spawn(phpPath, ['-f', phpScriptPath]);

    php.stdout.on('data', (data) => {
        res.send(data.toString());
    });

    php.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    php.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
});
////ends here
// -registration.php
app.get('/registration.php', (req, res) => {
    const phpPath = '/opt/lampp/bin/php-cgi'; // Replace 'full/path/to/php-cgi' with the actual path to php-cgi
    const phpScriptPath = path.join(__dirname, 'registration.php');
    
    const php = spawn(phpPath, ['-f', phpScriptPath]);

    php.stdout.on('data', (data) => {
        res.send(data.toString());
    });

    php.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    php.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });});
// ends here
app.listen(port, () => {
    console.log(`PayMaster app listening at http://localhost:${port}`);
});
// routes here
const adminRouter = require('./routes/admin');
app.use('/', adminRouter);
const landingRouter = require('./routes/landing');
app.use('/', landingRouter);
*/
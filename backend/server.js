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
    console.log(`PayMaster app listening at http://localhost:${port}`);
});
const path = require('path');

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Catch-all handler to return the React app
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public', 'login.html'));
});
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public', 'register.html'));
  });

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public', 'profile.html'));
});
// MySQL connection
const database = require('./database.js')
app.get('/test', (req, res) => {
  database.query('SELECT 1 + 1 AS solution', (err, results) => {
      if (err) {
          console.error('Database query error:', err);
          res.status(500).json({ error: 'Database connection failed' });
      } else {
          console.log('Database connection successful:', results);
          res.json({ message: 'Database connection successful', results });
      }
  });
});

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
app.get('/profile', (req, res) => {
  res.send('Welcome to your profile page!');
  });
// Register route
app.post('/register', async (req, res) => {
  const { firstName, lastName, password } = req.body;

  // Hash the password before storing it in the database
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert new employee into the database
  database.query(
    'INSERT INTO Employee (FirstName, LastName) VALUES (?, ?)',
    [firstName, lastName],
    (err, result) => {
      if (err) {
        console.error('Error registering employee:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        // Get the newly created employee ID
        const employeeID = result.insertId;

        // Insert login credentials for the new employee
        database.query(
          'INSERT INTO employee_login (EmployeeID, Password) VALUES (?, ?)',
          [employeeID, hashedPassword],
          (err, result) => {
            if (err) {
              console.error('Error creating login credentials:', err);
              res.status(500).json({ error: 'Internal server error' });
            } else {
              res.status(201).json({ message: 'Employee registered successfully!', redirectTo: '/login' });
            }
          }
        );
      }
    }
  );
});
 /* 

const adminRouter = require('./routes/admin');
app.use('/', adminRouter);
const landingRouter = require('./routes/landing');
app.use('/', landingRouter);
*/
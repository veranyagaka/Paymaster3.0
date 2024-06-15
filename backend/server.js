const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
//const config = require('/config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const path = require('path');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true })); 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
  res.render('land');
});

app.listen(port, () => {
    console.log(`PayMaster app listening at http://localhost:${port}`);
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Catch-all handler to return the React app
app.get('/login', (req, res) => {
  res.render('login');
});
app.get('/register', (req, res) => {
  res.render('register');
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
    try {
      const [result] = await database.query(
        'SELECT * FROM Employee WHERE EmployeeID = ?',
        [employeeID]
      );
      console.log('Queried user:', result);
      if (!result.length) {
        return res.status(401).json({ error: 'Invalid employeeID2 or password' });
      }
  
      const validPassword = await bcrypt.compare(password, result[0].password);
  
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid employeeID or password' });
      }
            console.log('Stored Password:', result[0].password);
            //maybe jwt functionality?
            res.send({ message: 'Login successful.', redirect: '/profile' });
          } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
          }
        });
// Register route
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  console.log(`Received email: ${email}, password: ${password}`);

  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }
  const existingUserSql = 'SELECT * FROM Employee WHERE email = ?';

  try {
    const [rows] = await database.query(existingUserSql, [email]);
    if (rows.length > 0) {
      return res.status(409).send('Email already exists');
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal server error');
  }

  // Hash password before storing
  const saltRounds = 10; // Adjust salt rounds for security
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const sql = 'INSERT INTO Employee (email, password) VALUES (?, ?)';
  try {
    await database.query(sql, [email, hashedPassword]);
    res.send({ message: 'Registration successful. Please login.', redirect: '/login' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Registration failed');
  }
  //
});
app.get('/profile', (req, res) => {
  const employee = {
    name: 'John Doe',
    position: 'Software Engineer',
    department: 'Development',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    about: 'John is a dedicated software engineer with 5 years of experience in web development.'
  };
  res.render('profile', { employee });
});

//admin page
function isAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(401).send('Unauthorized');
  }
  next();
}

app.get('/admin', (req, res) => {
  res.render('admin-dashboard'); 
});
app.get('/ad', async (req, res) => {
  try {
      // Retrieve employees from the database
      const [rows] = await database.query('SELECT * FROM employee_profile');
      res.render('admin.ejs', { employees: rows });
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
});
app.get('/profile/:id', async (req, res) => {
  try {
      const [rows] = await database.query('SELECT * FROM Employee WHERE employeeID = ?', [req.params.id]);
      const employee = rows[0];
      res.render('profile', { employee });
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
});

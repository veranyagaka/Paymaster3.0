const express = require('express');
const app = express();
const port = process.env.PORT || 2000;
//const config = require('/config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');

app.use(bodyParser.urlencoded({ extended: true })); 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));
app.use(flash());

app.use((req, res, next) => {
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});
function displayFullDate() {
  const today = new Date();
  const day = today.getDate();
  const month = today.toLocaleString('default', { month: 'long' });
  const year = today.getFullYear();
  const fullDate = `${day} ${month} ${year}`;
  return fullDate;
}
app.get('/', (req, res) => {
  res.render('land', {displayFullDate});
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
app.get('/side', (req, res) => {
  res.render('sidebar');
});
app.get('/register', (req, res) => {
  res.render('register');
  });
// MySQL connection
const database = require('./database.js')

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
            res.redirect('/profile');
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
app.get('/profile2', (req, res) => {
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
function isAuthenticated(req, res, next) {
  if (req.session.adminId) {
    return next();
  } else {
    req.flash('error', 'You need to be logged in to view this page');
    res.redirect('/admin-login');
  }
}
app.get('/admin-login', (req, res) => {
  res.render('admin-login');
});
app.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [result] = await database.query(
      'SELECT * FROM admin WHERE email = ?',
      [email]
    );
    console.log('Queried admin:', result);
    if (!result.length) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, result[0].password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
          req.session.adminId = result[0].id;  // Set admin ID in session
          console.log('Stored Password:', result[0].password);
          //maybe jwt functionality?
          res.redirect('/admin');
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal server error' });
        }
      });
const adminRouter =require('./routes/admin')
app.use('/admin', adminRouter)

app.get('/profile', async (req, res) => {
  try {
      const [rows] = await database.query('SELECT * FROM employee_profile WHERE employeeID = ?', [req.params.id]);
      const employee = rows[0];
      res.render('profile', { employee: employee });
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
});
const payRouter =require('./routes/payslip')
app.use('/pay', payRouter)
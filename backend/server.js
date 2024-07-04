const express = require('express');
const app = express();
const port = process.env.PORT || 2000;
//const config = require('/config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const sendEmail = require('./routes/sendEmail'); 
const {sendEmail2} = require('./routes/sendEmail'); 
const {sendEmail3} = require('./routes/sendEmail'); 
const connectToDatabase = require('./db');
const database = await connectToDatabase();

// Local MySQL connection
//const database = require('./database.js')

const corsOptions = {
  origin: ['https://your-frontend-app.com', 'http://localhost:2000'],
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization']

};
app.get('/test', async (req, res) => {
  try {
    const [rows] = await connection.query('SELECT 1');
    res.send('Database connection successful!');
  } catch (err) {
    res.status(500).send('Database connection failed');
  }
});
app.get('/employees', async (req, res) => {
  try {
    const connection = await connectToDatabase();      
      const [rows] = await connection.query('SELECT * FROM employee_profile');
      res.send(rows);
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
});
app.use(cors(corsOptions));
//enables cors
app.use(cors({
  'allowedHeaders': ['sessionId', 'Content-Type'],
  'exposedHeaders': ['sessionId'],
  'origin': '*',
  'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
  'preflightContinue': false
}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Serve static files
app.use(express.static('frontend'));
app.use(express.static(path.join(__dirname, '../frontend/')));
app.use(express.json());
app.use(express.static('frontend', { 
  setHeaders: (res, path) => {
      if (path.endsWith('.js')) {
          res.setHeader('Content-Type', 'text/javascript');
      }
  }
}));
app.use(session({
  secret: 'your_secret_key_here',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 } // Expires in 1 hour
}));
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json());

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
  res.render('land');
});
app.get('/nav', (req, res) => {
  res.render('navigationbar', {displayFullDate});
});
app.get('/css', (req, res) => {
  res.render('index');
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
  res.render('test');
});
app.get('/register', (req, res) => {
  res.render('register');
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
        return res.render('login', { error: 'Incorrect Employee ID or Password.' });
      }
  
      const validPassword = await bcrypt.compare(password, result[0].password);
  
      if (!validPassword) {
        return res.render('login', { error: 'Incorrect Employee ID or Password.' });
      }
            console.log('Stored Password:', result[0].password);
            //maybe jwt functionality?
            req.session.EmployeeID = result[0].EmployeeID;
            req.session.save((err) => {
              if (err) {
                console.error(err);
              } else {
                console.log('Session saved:', req.session.EmployeeID);
                const subject = 'New login detected!';
                const message = `Hi there! New sign in to your PayMaster account <br> If this was you, then you don't need to do anything. <br>If you don't recognise this activity, please change your password.`;
                //sendEmail3(subject, message);
                res.redirect('employee-profile');
              }
            });
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
    const result = await database.query(sql, [email, hashedPassword]);
    const employeeID = result[0].insertId;
    const profile = 'INSERT INTO employee_profile (employeeID, email) VALUES (?,?)';
    await database.query(profile, [employeeID, email]);
    const subject = 'Welcome to Paymaster';
    const message = `Hi there! You've successfully registered for an account. Your employee ID is ${employeeID}. <br> You can login to your account here: `;
    await sendEmail2(subject, message, employeeID);
    setTimeout(() => {
      res.redirect('/login');
    }, 3000); 
  } catch (err) {
    console.error(err);
    res.status(500).send('Registration failed');
  }
  //
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
      return res.render('admin-login', { error: 'Incorrect email or Password.' });;   
    }

    const validPassword = await bcrypt.compare(password, result[0].password);

    if (!validPassword) {
      return res.render('admin-login', { error: 'Incorrect email or Password.' });;   
   }
          req.session.adminId = result[0].id;  // Set admin ID in session
          console.log('Stored Password:', result[0].password);
          return res.redirect('/admin');
     } catch (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal server error' });
        }
      });
const adminRouter =require('./routes/admin')
app.use('/admin', adminRouter)

app.get('/employee-profile', async (req, res) => {
  req.flash('success', 'Login successful!');

  console.log('Session check employeeID:', req.session.EmployeeID);
  if (!req.session.EmployeeID) {
    return res.status(401).redirect('/login'); // Redirect to login if no session
  }
  try {
      const [rows] = await database.query('SELECT * FROM employee_profile WHERE employeeID = ?', [req.session.EmployeeID]);
      const employee = rows[0];
      if (!employee) {
        return res.status(404).send('Employee profile not found');
      }
      const showPaymentButton = false;
      res.render('employee-profile', { employee: employee, showPaymentButton: showPaymentButton });
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
});
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }
    res.redirect('/login');
  });
});
const payRouter =require('./routes/payslip')
app.use('/pay', payRouter)
const accountsRouter =require('./routes/accounts')
app.use('/accounts', accountsRouter)
//const sendEmail = require('./routes/sendEmail'); 
/*
sendEmail()
    .then(() => {
        console.log('Email sent successfully');
        // Handle any further logic after email is sent
    })
    .catch(err => {
        console.error('Failed to send email:', err);
        // Handle error condition
    });
    */
const reportsRouter =require('./routes/reports')
app.use('/re', reportsRouter)
app.use((req, res, next) => {
  res.status(404).render('404');
});
const express =require('express');
const router =express.Router();
const path = require('path');
const multer = require('multer');
const pdf = require('html-pdf'); 
const database = require('../database.js')
const fs = require('fs');
// Set up multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile_pics');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.session.employeeID}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// Change profile picture route for employees
router.post('/changeProfilePic', upload.single('profilePic'), async (req, res) => {
  
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const employeeId = req.session.employeeID;
  const profilePicPath = `/uploads/profile_pics/${req.file.filename}`;

  try {
    // Update the employee's profile picture path in the database
    await database.query('UPDATE employee_profile SET profile_picture = ? WHERE employeeID = ?', [profilePicPath, employeeId]);
    res.redirect('/profile'); // Redirect to the employee's profile page after successful update
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});
router.post('/changePassword', async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const employeeId = req.session.employeeID; // Assuming the employee is logged in and their ID is stored in the session

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).send('All fields are required.');
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).send('New passwords do not match.');
  }

  try {
    // Fetch the current employee from the database
    const [employee] = await database.query('SELECT * FROM Employee WHERE EmployeeID = ?', [employeeId]);

    if (!employee) {
      return res.status(404).send('Employee not found.');
    }

    // Check if the current password is correct
    const isMatch = await bcrypt.compare(currentPassword, employee.password);

    if (!isMatch) {
      return res.status(400).send('Current password is incorrect.');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    await database.query('UPDATE employees SET password = ? WHERE id = ?', [hashedPassword, employeeId]);

    res.send('Password changed successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/payslip', async(req, res) => {
  if (!req.session.EmployeeID) {
    return res.status(401).redirect('/login'); // Redirect to login if no session
  }
  const employeeID = req.session.EmployeeID;
  
  try {
    const [payrollData] = await database.query('SELECT * FROM payroll_history where employeeID = ? ',[employeeID]);
    res.render('payroll-history', { payrollData: payrollData });
} catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
}
});
function calculateNetPay({ firstName, lastName, email, employeeID, department, bio, baseSalary, allowances }) {
  // Perform salary calculations here
  const finalSalary = baseSalary + allowances;

  return {
    firstName,
    lastName,
    email,
    employeeID,
    department,
    bio,
    baseSalary,
    allowances,
    finalSalary
  };
}

router.get('/finance', async(req,res )=>{
  if (!req.session.EmployeeID) {
    return res.status(401).redirect('/login'); // Redirect to login if no session
  }
  const employeeID = req.session.EmployeeID;
  const [employee] = await database.query('SELECT * FROM employee_profile where employeeID =?',[employeeID])
  console.log(employee);

  if (!employee) {
    // Employee not found with this ID
    return res.status(404).render('error', { message: 'Employee not found!' });
  }
    // Ensure proper mapping of employee data
    const employeeData = {
      firstName: employee[0].first_name || '',
      lastName: employee[0].last_name || '',
      email: employee[0].email || '',
      employeeID: req.session.EmployeeID || 0,
      department: employee[0].department || '',
      bio: employee[0].bio || '',
      baseSalary: parseFloat(employee[0].baseSalary) || 0,
      allowances: parseFloat(employee[0].allowance) || 0
    };
    console.log(employeeData);

    const salaryComponents = calculateNetPay(employeeData);
    console.log(salaryComponents);
  res.render('finance', {salaryComponents: salaryComponents});
});
router.post('/employees/payment-details/:employeeId', (req, res) => {
  const employeeID = req.session.EmployeeID;
  const bankName = req.body.bankName;
  const bankAccountName = req.body.bankAccountName;
  const bankAccountNumber = req.body.bankAccountNumber;

  // Prepare SQL query
  const sql = `INSERT INTO paymentdetails (employeeID, bankName, bankAccountName, bankAccountNumber) VALUES (?, ?, ?, ?)`;

  // Execute query with prepared statement to prevent SQL injection vulnerabilities
  database.query(sql, [employeeID, bankName, bankAccountName, bankAccountNumber], (error, results) => {
    if (error) {
      console.error(error);
      res.send('Error inserting data');
    } else {
      res.send('Payment details saved successfully!');
    }
  });
});

router.get('/leave_application', async (req, res) => {
    if (!req.session.EmployeeID) {
        return res.status(401).redirect('/login'); // Redirect to login if no session
      }
    const employeeId = req.session.EmployeeID;
    console.log('Leave Application employee no: ', employeeId)

    try {
        // Retrieve employees from the database
        const [leave_requests] = await database.query('SELECT * FROM leave_requests where employee_id=?', [employeeId]);
        res.render('leave_application', { leaveRequests: leave_requests });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
    res.render('leave_application'); 
});

// Route to handle leave application form submission
router.post('/apply_leave', async (req, res) => {
    const employeeId = req.session.EmployeeID;
    console.log('Leave Application loading employee no: ', employeeId)
    const {leave_type, start_date, end_date } = req.body;

    try {
        // Insert the leave request into the database
        await database.query(
            'INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date) VALUES (?, ?, ?, ?)',
            [employeeId, leave_type, start_date, end_date]
        );        
        res.send('Leave application submitted successfully.');
    } catch (error) {
        console.error('Error submitting leave application:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/employees/edit/:employeeId', async (req, res) => {
    //const employeeId = req.session.EmployeeID;
    const employeeId = req.params.employeeId;

    console.log('Editing info from employee no: ', employeeId)
    const { firstName, bio, lastName, email } = req.body; // Destructure data from request body
  
    try {
      // Update employee data in the database
      await database.query('UPDATE employee_profile SET first_name = ?, bio = ?,last_name = ?, email = ? WHERE employeeID = ?', [firstName, bio, lastName, email,employeeId]);
      await database.query('UPDATE Employee SET FirstName = ?,LastName = ?, email = ? WHERE EmployeeID = ?', [firstName,lastName, email,employeeId]);

      // Handle successful update (e.g., redirect to employee list, display success message)
      res.redirect('/employee-profile'); // Replace as needed
  
    } catch (error) {
      console.error('Error updating profile:', error);
      // Handle errors (e.g., display error message to user, log the error)
      res.status(500).send('Internal Server Error');
    } 
  });
const employees = [
    {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        employeeID: '1',
        department: 'Engineering',
        bio: 'Software Engineer with 5 years of experience.',
        baseSalary: 60000,
        bonusPercentage: 10,
        socialSecurityDeduction: 3000,
        healthcareDeduction: 2000,
        taxPercentage: 20,
        totalHoursWorked: 200,
        housingAllowance: 5000,
        transportAllowance: 2000
    },
    {
        id: 2,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        employeeID: '2',
        department: 'Marketing',
        bio: 'Marketing Specialist with 3 years of experience.',
        baseSalary: 55000,
        bonusPercentage: 12,
        socialSecurityDeduction: 2800,
        healthcareDeduction: 1800,
        totalHoursWorked: 180,
        taxPercentage: 18,
        housingAllowance: 4000,
        transportAllowance: 1500
    }
    // Add more employees as needed
];
router.get('/employee/salary/:id', (req, res) => {
  const employeeId = parseInt(req.params.id, 10);
  console.log(employeeId);

  const employee = employees.find(emp => emp.id === employeeId);

  if (!employee) {
      return res.status(404).send('Employee not found');
  }

  const salaryComponents = calculateFinalSalary(employee, 'June');
  res.render('salary', { salaryComponents,employee });
});
// Route to generate PDF
router.get('/employee/salary/:id/download', async(req, res) => {
  const employeeId = parseInt(req.params.id, 10);
  console.log(employeeId);
  const [employee] = await database.query('SELECT * FROM employee_profile where employeeID =?',[employeeId])
console.log('Employee: ,' ,employee)
  if (!employee) {
      return res.status(404).send('Employee not found');
  }

  const salaryComponents = calculateFinalSalary(employee, 'June');

  res.render('employee-pdf', { salaryComponents }, (err, html) => {
      if (err) {
          console.log(err);
          return res.status(500).send('Error generating PDF');
          console.log(err);
      }

      const options = { format: 'Letter' };

      pdf.create(html, options).toFile('./employee-report.pdf', (err, result) => {
          if (err) {
              return res.status(500).send('Error generating PDF');
          }

          res.download(result.filename, 'employee-report.pdf', (err) => {
              if (err) {
                  return res.status(500).send('Error downloading PDF');
              }

              // Delete the file after download
              fs.unlink(result.filename, (err) => {
                  if (err) {
                      console.error('Error deleting PDF file:', err);
                  }
              });
          });
      });
  });
});
function calculateFinalSalary(employee, month) {
    const baseSalary = employee.baseSalary;
    const bonus = (baseSalary * employee.bonusPercentage) / 100;
    const grossIncome = baseSalary + bonus;
    const totalDeductions = employee.socialSecurityDeduction + employee.healthcareDeduction;
    const taxableIncome = grossIncome - totalDeductions;
    const tax = (taxableIncome * employee.taxPercentage) / 100;
    const allowances = employee.housingAllowance + employee.transportAllowance;
    const regularHours = 160; // 40 hours * 4 weeks
    const overtimeHours = employee.totalHoursWorked > regularHours ? employee.totalHoursWorked - regularHours : 0;
    const overtimePay = overtimeHours * (employee.baseSalary / regularHours * 1.5);
    const finalSalary = grossIncome + allowances - totalDeductions - tax + overtimePay;


    return {
        firstName: employee.first_name,
        lastName: employee.last_name,
        email: employee.email,
        employeeID: employee.employeeID,
        department: employee.department,
        bio: employee.bio,
        baseSalary,
        bonus,
        grossIncome,
        allowances,
        overtimeHours,
        overtimePay,
        totalDeductions,
        taxableIncome,
        tax,
        finalSalary,
        month
    };
}
router.get('/reset_password', (req, res) => {
    const token = req.query.token;
    if (verifyResetToken(token)) {
      res.render('reset_password', { token });
    } else {
      res.status(400).send('Invalid or expired token');
    }
  });
function verifyResetToken(token) {
    // You should implement your own logic to verify the reset token
    return true; // Assume the token is valid for demonstration purposes
  }
router.get('/employee-attendance', async(req, res) => {
    if (!req.session.EmployeeID) {
        return res.status(401).redirect('/login'); // Redirect to login if no session
      }
    const employeeId = req.session.EmployeeID;
    console.log('Attendance for employee no: ', employeeId)
    try{
    const [attendanceRecords] = await database.query('SELECT * FROM attendance_records where employee_Id=?',[employeeId]);
    res.render('employee-attendance',{attendanceRecords: attendanceRecords }); 

    /*const [{employee} ]= await database.query('SELECT * FROM employee_profile where employeeID=?', [employeeId]);
    if (employee && employee.length > 0) {
        console.log('Employee First Name: ', employee[0].first_name);
      } else {
        console.log('No employee found with ID:', employeeId);
      }
    const attendance = await database.query('SELECT * FROM attendance_records where employee_id=?', [employeeId]);
    console.log('Attendance Length ', attendance.length )
*/
    }
    catch(err){
        console.error(err);
        res.status(500).send('Internal Server Error');    }
});
//email sending bruh
const sendEmail = require('./sendEmail'); 

router.post('/contact-admin', async (req, res) => {
    try {
      //const employeeID = req.body.employeeID; // Access employee ID from form data
      const subject = req.body.subject;
      const message = req.body.message;
  
      // Optional: Validate and sanitize form data (if needed)
  
      await sendEmail(subject, message); // Call your sendEmail function
  
      res.status(200).send('Email sent successfully!'); // Respond to the client
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).send('Failed to send email'); // Handle errors
    }
  });

module.exports= router
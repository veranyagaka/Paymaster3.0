const express =require('express');
const router =express.Router();
const path = require('path');
const multer = require('multer');
const pdf = require('html-pdf'); 
//const database = require('../database.js')
const fs = require('fs');
const bcrypt = require('bcrypt');
const database = require('../db.js');

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'backend/uploads/profile_pics');
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

  const employeeId = req.session.EmployeeID;
  const profilePicPath = path.join(__dirname,`../../frontend/uploads/profile_pics/${req.file.filename}`);

  try {
    // Update the employee's profile picture path in the database
    await database.query('UPDATE employee_profile SET profile_picture = ? WHERE employeeID = ?', [profilePicPath, employeeId]);
    res.redirect('/employee-profile'); // Redirect to the employee's profile page after successful update
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});
router.post('/changePassword', async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const employeeId = req.session.EmployeeID; // Assuming the employee is logged in and their ID is stored in the session
  console.log('Employee checkpint no: ',employeeId );
  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).send('All fields are required.');
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).send('New passwords do not match.');
  }

  try {
    // Fetch the current employee from the database
    const [rows] = await database.query('SELECT * FROM Employee WHERE EmployeeID = ?', [employeeId]);
    const employee = rows[0];
    console.log(employee);
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
    await database.query('UPDATE Employee SET password = ? WHERE EmployeeID = ?', [hashedPassword, employeeId]);

    setTimeout(() => {
      res.redirect('/login');
    }, 3000); 
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
function mapEmployeeData(employee, paymentdetails, overtimeHours) {
  return {
    firstName: employee.first_name || '',
    lastName: employee.last_name || '',
    email: employee.email || '',
    employeeID: employee.employeeID,
    department: employee.department || '',
    bio: employee.bio || '',
    baseSalary: parseFloat(employee.baseSalary) || 0,
    transportAllowance: parseFloat(employee.transport_allowance) || 0,
    medicalAllowance: parseFloat(employee.medical_allowance) || 0,
    mealAllowance: parseFloat(employee.meal_allowance) || 0,
    totalAllowances: parseFloat(employee.total_allowances) || 0,
    bonus: parseFloat(employee.bonus) || 0,
    overtimeHours: parseFloat(overtimeHours) || 0,
    hourlyRate: parseFloat(employee.hourlyRate) || 0,
    bankName: paymentdetails.bankName || '',
    bankAccountName: paymentdetails.bankAccountName || '',
    bankAccountNumber: paymentdetails.bankAccountNumber || ''
  };
}

// Calculate net pay function
function calculateNetPay(employeeData) {
  const retirementInsuranceRate = 0.1;

  let finalSalaryBeforeDeductions = employeeData.baseSalary + employeeData.totalAllowances;
  let taxRate;
  if (finalSalaryBeforeDeductions <= 24000.00) {
    taxRate = 0.10;
  } else if (finalSalaryBeforeDeductions <= 32333.00) {
    taxRate = 0.25;
  } else {
    taxRate = 0.30;
  }

  const overtimePay = employeeData.overtimeHours * 25;
  finalSalaryBeforeDeductions += overtimePay;

  const taxAmount = finalSalaryBeforeDeductions * taxRate;
  const retirementInsuranceAmount = finalSalaryBeforeDeductions * retirementInsuranceRate;
  const totalDeductions = retirementInsuranceAmount + taxAmount;

  const netSalary = finalSalaryBeforeDeductions - taxAmount - retirementInsuranceAmount;
  const numberToWords = require('number-to-words');

  let netSalaryInWords = numberToWords.toWords(netSalary);

// Function to convert string to title case
function toTitleCase(str) {
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

// Format the output in title case
netSalaryInWords = toTitleCase(netSalaryInWords);
console.log(`Net Salary in Words: ${netSalaryInWords}`);

  return {
    ...employeeData,
    finalSalaryBeforeDeductions,
    overtimePay,
    taxAmount,
    totalDeductions,
    retirementInsuranceAmount,
    netSalary,
    netSalaryInWords
  };
}

router.get('/finance', async (req, res) => {
  if (!req.session.EmployeeID) {
    return res.status(401).redirect('/login'); // Redirect to login if no session
  }
  const employeeID = req.session.EmployeeID;
  async function getPaymentDetailsByEmployeeId(employeeID) {
    const query = 'SELECT * FROM paymentdetails WHERE employeeID = ?';
    const [rows] = await database.query(query, [employeeID]);
    return rows;
  }
  const paymentDetails = await getPaymentDetailsByEmployeeId(req.session.EmployeeID);
    if (paymentDetails.length === 0) {
      return res.redirect('/employee-profile'); // Redirect to payment details entry page
    }
  const currentDate = new Date();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based in JavaScript
  const currentYear = currentDate.getFullYear();
  const currentYearMonth = `${currentYear}-${currentMonth}`;

 console.log('date',currentYearMonth)
  const [employee] = await database.query('SELECT * FROM employee_profile WHERE employeeID = ?', [employeeID]);
  const [paymentdetails] = await database.query('SELECT * FROM paymentdetails WHERE employeeID = ?', [employeeID]);
  const [attendanceRecords] = await database.query(
    'SELECT * FROM attendance_records WHERE employee_id = ?  AND month = ?',
    [employeeID, currentYearMonth]
  );
  console.log(attendanceRecords)
  if (!employee.length) {
    return res.status(404).render('error', { message: 'Employee not found!' });
  }
  const overtimeHours = attendanceRecords[0]?.overtime_hours || 0;

  const employeeData = mapEmployeeData(employee[0], paymentdetails[0], overtimeHours);
  const salaryComponents = calculateNetPay(employeeData);

  res.render('finance', { salaryComponents });
});

router.post('/employees/payment-details/', async (req, res) => {
  const employeeID = req.session.EmployeeID;
  const { setbankName, setbankAccountName, setbankAccountNumber } = req.body;

  // Prepare SQL query
  const sql = `INSERT INTO paymentdetails (employeeID, bankName, bankAccountName, bankAccountNumber) VALUES (?, ?, ?, ?)`;

  try {
    // Execute query with prepared statement to prevent SQL injection vulnerabilities
    await database.query(sql, [employeeID, setbankName, setbankAccountName, setbankAccountNumber]);
    // Redirect to profile page after 3 seconds
    setTimeout(() => {
      res.redirect('/employee-profile');
    }, 3000);
  } catch (error) {
    console.error(error);
    res.send('Error inserting data');
  }
});

router.post('/employees/edit-payment-details/:employeeId', async (req, res) => {
  const employeeID = req.session.EmployeeID;
  const { bankName, bankAccountName, bankAccountNumber } = req.body;

  // Prepare SQL query
  const sql = `UPDATE paymentdetails SET bankName = ?, bankAccountName = ?, bankAccountNumber = ? WHERE employeeID = ?`;

  try {
    // Execute query with prepared statement to prevent SQL injection vulnerabilities
    await database.query(sql, [bankName, bankAccountName, bankAccountNumber, employeeID]);
    // Redirect to profile page after 3 seconds
    setTimeout(() => {
      res.redirect('/employee-profile');
    }, 3000);
  } catch (error) {
    console.error(error);
    res.send('Error updating data');
  }
});


router.get('/leave_application', async (req, res) => {
    if (!req.session.EmployeeID) {
        return res.status(401).redirect('/login'); // Redirect to login if no session
      }
    const employeeId = req.session.EmployeeID;
    console.log('Leave Application employee no: ', employeeId)

    try {
        // Retrieve employees from the database
        const [leaveRequests] = await database.query('SELECT * FROM leave_requests where employee_id=?', [employeeId]);
        console.log(leaveRequests);
        return res.render('leave_application', { leaveRequests: leaveRequests });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
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
res.redirect('/accounts/leave_application');
    } catch (error) {
        console.error('Error submitting leave application:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/employees/edit/:employeeId', async (req, res) => {
    //const employeeId = req.session.EmployeeID;
    const employeeId = req.params.employeeId;

    console.log('Editing info from employee no: ', employeeId)
    const { firstName, bio, lastName, gender } = req.body; // Destructure data from request body
  
    try {
      // Retrieve existing employee data
      const [existingProfileData] = await database.query('SELECT first_name, bio, last_name, gender FROM employee_profile WHERE employeeID = ?', [employeeId]);
      const [existingEmployeeData] = await database.query('SELECT FirstName, LastName FROM Employee WHERE EmployeeID = ?', [employeeId]);
      console.log('exisiting: ', existingEmployeeData)
      if (!existingProfileData || !existingEmployeeData) {
          res.status(404).send('Employee not found');
          return;
      }

      // Merge existing data with new data
      const updatedProfileData = {
          first_name: firstName || existingProfileData[0].first_name,
          bio: bio || existingProfileData[0].bio,
          last_name: lastName || existingProfileData[0].last_name,
          gender: gender || existingProfileData[0].gender
      };

      const updatedEmployeeData = {
          FirstName: firstName || existingEmployeeData[0].FirstName,
          LastName: lastName || existingEmployeeData[0].LastName
      };
      console.log('first: ', existingEmployeeData[0].FirstName)

      console.log('last: ', existingEmployeeData[0].LastName)

      // Update employee data in the database
      await database.query(
          'UPDATE employee_profile SET first_name = ?, bio = ?, last_name = ?, gender = ? WHERE employeeID = ?',
          [updatedProfileData.first_name, updatedProfileData.bio, updatedProfileData.last_name, updatedProfileData.gender, employeeId]
      );
      await database.query(
          'UPDATE Employee SET FirstName = ?, LastName = ? WHERE EmployeeID = ?',
          [updatedEmployeeData.FirstName, updatedEmployeeData.LastName, employeeId]
      );

      // Handle successful update (e.g., redirect to employee list, display success message)
      res.redirect('/employee-profile'); // Replace as needed

  } catch (error) {
      console.error('Error updating profile:', error);
      // Handle errors (e.g., display error message to user, log the error)
      res.status(500).send('Internal Server Error');
  }
});
// Route to generate PDF
router.get('/employee/salary/:id/download', async (req, res) => {
  const employeeId = parseInt(req.params.id, 10);
  console.log(employeeId);
  const [employee] = await database.query('SELECT * FROM employee_profile WHERE employeeID = ?', [employeeId]);
  const [paymentdetails] = await database.query('SELECT * FROM paymentdetails WHERE employeeID = ?', [employeeId]);

  console.log('Employee: ', employee);
  if (!employee.length) {
    return res.status(404).send('Employee not found');
  }

  const employeeData = mapEmployeeData(employee[0], paymentdetails[0]);
  const salaryComponents = calculateNetPay(employeeData);
  const currentDate = new Date();
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const currentMonth = monthNames[currentDate.getMonth()]; // Get the month name
const currentYear = currentDate.getFullYear();
const currentYearMonth = `${currentMonth} ${currentYear}`;

console.log(currentYearMonth); // Output: e.g., "July 2024"
const logo = "/favicon.ico"
console.log('logo:',logo)
  res.render('payslip', { salaryComponents,currentYearMonth,logo, paymentDate: new Date().toLocaleDateString('en-US') }, (err, html) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error generating PDF');
    }

    const options = { format: 'Letter' };

    pdf.create(html, options).toFile('./employee-payslip.pdf', (err, result) => {
      if (err) {
        return res.status(500).send('Error generating payslip');
      }

      res.download(result.filename, 'employee-payslip.pdf', (err) => {
        if (err) {
          console.log('Payslip error', err)

          return res.status(500).send('Error downloading payslip',err);
        }

        // Delete the file after download
        fs.unlink(result.filename, (err) => {
          if (err) {
            console.error('Error deleting payslip:', err);
          }
        });
      });
    });
  });
});
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
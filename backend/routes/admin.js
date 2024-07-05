const express =require('express');
const router =express.Router();
const path = require('path');
//const database = require('../database.js')
//const connectToDatabase = require('../db.js');
const database = require('../db.js');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const csv = require('csv-parser'); // For CSV files
const xlsx = require('xlsx'); // For Excel files
const multer = require('multer');
// Route for payroll history with pagination

router.get('/payrollhistory', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const offset = (page - 1) * limit;

  try {
    const [results] = await database.query(
      'SELECT * FROM payroll_history LIMIT ? OFFSET ?',
      [limit, offset]
  );
      const [countResult] = await database.query('SELECT COUNT(*) AS count FROM payroll_history');
      const totalRecords = countResult[0].count;
      const totalPages = Math.ceil(totalRecords / limit);

      if (results.length === 0) {
          return res.render('admin-payrollhistory', { payrolls: [], message: 'No payroll records at the moment.', currentPage: page, totalPages: 0 });
      }

      res.render('admin-payrollhistory', { payrolls: results, message: '', currentPage: page, totalPages });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
  }
});
router.get('/data', async (req, res) => {
  try {
      const [results] = await database.query(
          'SELECT * FROM payroll_history'
      );
      console.log('Results type:', typeof results);

      // Check if results is an array
      if (Array.isArray(results)) {

          console.log('Results:', results);
          console.log('Results length:', results.length);

          if (results.length === 0) {
              return res.render('data', { payrolls: [], message: 'No payroll records at the moment.' });
          }

          res.render('data', { payrolls: results, message: '' });
      } else {
          console.log('Unexpected result format:', results);
          res.status(500).json({ error: 'Unexpected result format' });
      }
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
  }
});


// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/attendance');
  },
  filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });

// Route to handle file upload and import attendance data
router.post('/importAttendance', upload.single('attendanceFile'), async (req, res) => {
  const filePath = req.file.path;
  const fileExtension = path.extname(req.file.originalname).toLowerCase();

  try {
      if (fileExtension === '.csv') {
          // Parse CSV file
          const attendanceRecords = [];
          fs.createReadStream(filePath)
              .pipe(csv())
              .on('data', (row) => {
                  attendanceRecords.push(row);
              })
              .on('end', async () => {
                  try {
                      // Insert data into the attendance_records table
                      for (const record of attendanceRecords) {
                          const { employeeID, month, daysPresent, daysAbsent, overtimeHours } = record;
                          await database.query(
                              'INSERT INTO attendance_records (employeeID, month, daysPresent, daysAbsent, overtimeHours) VALUES (?, ?, ?, ?, ?)',
                              [employeeID, month, daysPresent, daysAbsent, overtimeHours]
                          );
                      }
                      res.status(200).send('Attendance records imported successfully');
                  } catch (err) {
                      console.error('Error inserting data into database:', err);
                      res.status(500).send('Error importing attendance records');
                  }
              });
      } else if (fileExtension === '.xlsx') {
          // Parse Excel file
          const workbook = xlsx.readFile(filePath);
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const attendanceRecords = xlsx.utils.sheet_to_json(sheet);

          try {
              // Insert data into the attendance_records table
              for (const record of attendanceRecords) {
                  const { employeeID, month, daysPresent, daysAbsent, overtimeHours } = record;
                  await database.query(
                      'INSERT INTO attendance_records (employeeID, month, daysPresent, daysAbsent, overtimeHours) VALUES (?, ?, ?, ?, ?)',
                      [employeeID, month, daysPresent, daysAbsent, overtimeHours]
                  );
              }
              res.status(200).send('Attendance records imported successfully');
          } catch (err) {
              console.error('Error inserting data into database:', err);
              res.status(500).send('Error importing attendance records');
          }
      } else {
          res.status(400).send('Unsupported file format');
      }
  } catch (err) {
      console.error('Error processing file:', err);
      res.status(500).send('Internal Server Error');
  } finally {
      // Remove the uploaded file after processing
      fs.unlinkSync(filePath);
  }
});
router.get('/', (req, res) => {
    res.render('admin-dashboard'); 
});
router.get('/employees', async (req, res) => {
  try {
    // Set the number of records per page
    const limit = 5;
    // Get the current page from the query parameters (default to 1 if not specified)
    const page = parseInt(req.query.page) || 1;
    // Calculate the offset
    const offset = (page - 1) * limit;

    // Fetch the total number of employee records
    const [countResult] = await database.query('SELECT COUNT(*) as totalRecords FROM employee_profile');
    
    // Extract totalRecords value or default to 0 if no records found
    const totalRecords = countResult.length > 0 ? countResult[0].totalRecords : 0;
    
    // Calculate the total number of pages
    const totalPages = Math.ceil(totalRecords / limit);

    // Fetch the employee records for the current page
    const [rows] = await database.query('SELECT * FROM employee_profile LIMIT ? OFFSET ?', [limit, offset]);

    res.render('admin.ejs', { 
      employees: rows, 
      currentPage: page, 
      totalPages 
    });
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/leave-requests', async(req, res) => {
    try {
        // Retrieve employees from the database
        const [leave_requests] = await database.query('SELECT * FROM leave_requests');
        res.render('leave-requests', { leave_requests: leave_requests });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});
router.post('/approve-leave/:requestId', async (req, res) => {
  const requestId = req.params.requestId;
  console.log('Approving leave request no:',requestId);

  try {
      const [result] = await database.query(
          'UPDATE leave_requests SET status = ? WHERE request_id = ?',
          ['Approved', requestId]
      );
console.log(result)
      if (result.affectedRows === 1) {
          res.status(200).json({ message: 'Leave request approved successfully.' });
      } else {
          res.status(404).json({ message: 'Leave request not found.' });
      }
  } catch (error) {
      console.error('Error updating leave request status:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});

router.post('/reject-leave/:requestId', async (req, res) => {
  const requestId = req.params.requestId;
  console.log('Rejecting leave request no:',requestId);

  try {
      const [result] = await database.query(
          'UPDATE leave_requests SET status = ? WHERE request_id = ?',
          ['Denied', requestId]
      );
console.log(result)
      if (result.affectedRows === 1) {
          res.status(200).json({ message: 'Leave request rejected.' });
      } else {
          res.status(404).json({ message: 'Leave request not found.' });
      }
  } catch (error) {
      console.error('Error updating leave request status:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});

router.post('/employees/add', async (req, res) => {
  const { first_name, last_name, email } = req.body; // Destructure data from request body

  try {
    const sql = 'INSERT INTO Employee (FirstName, LastName, email) VALUES (?, ?, ?)';
    const values = [first_name, last_name, email];

    // Perform the insertion asynchronously using await
    const [insertResult] = await database.query(sql, values);

    // Perform the insertion asynchronously using await
    if (insertResult.affectedRows === 1) {
      res.redirect('/admin'); 
    } else {
      console.error('Error adding employee:', insertResult);
      res.status(500).send('Failed to add employee');
    }
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.post('/employees/edit/:employeeId', async (req, res) => {
  const employeeId = req.params.employeeId;

  const { first_name,baseSalary,allowances, job_title, department } = req.body; // Destructure data from request body
  const availability = req.body.availability ? 'Available' : 'On Leave';

  try {
    // Retrieve existing employee data from the database
    const [employee] = await database.query('SELECT * FROM employee_profile WHERE employeeID = ?', [employeeId]);

    if (!employee) {
      return res.status(404).send('Employee not found');
    }

    // Update fields only if new values are provided
    const updatedEmployee = {
      first_name: first_name || employee.first_name,
      baseSalary: baseSalary || employee.baseSalary,
      allowances: allowances || employee.allowance,
      job_title: job_title || employee.job_title,
      department: department || employee.department,
    };

    // Update employee data in the database
    await database.query(
      'UPDATE employee_profile SET first_name = ?, baseSalary = ?, allowance = ?, job_title = ?, department = ? WHERE employeeID = ?',
      [updatedEmployee.first_name, updatedEmployee.baseSalary, updatedEmployee.allowances, updatedEmployee.job_title, updatedEmployee.department, employeeId]
    );
    // Handle successful update (e.g., redirect to employee list, display success message)
    res.redirect('/admin'); // Replace as needed

  } catch (error) {
    console.error('Error updating employee:', error);
    // Handle errors (e.g., display error message to user, log the error)
    res.status(500).send('Internal Server Error');
  } 
});
  // Route to handle employee deletion
  router.post('/employees/delete/:employeeId', async (req, res) => {
    const employeeId = req.params.employeeId;
  
    try {
      // Perform the deletion asynchronously using await
      const deleteResult = await database.query('DELETE FROM Employee WHERE EmployeeID = ?', [employeeId]);
  
      if (deleteResult.affectedRows === 0) {
        return res.status(404).send('Employee not found');
      }
  
      // Redirect to the admin page after successful deletion (replace with desired action)
      res.redirect('/admin');
    } catch (error) {
      console.error('Error deleting employee:', error);
      return res.status(500).send('Internal Server Error');
    }
  });
  router.post('/edit:employeeId', async (req, res) => {
    const employeeId = req.params.employeeId;

    const { first_name,baseSalary,allowance, job_title, department } = req.body; // Destructure data from request body
  
    try {
      // Update employee data in the database
      await database.query('UPDATE employee_profile SET first_name = ?, baseSalary = ? ,job_title = ?,allowance = ?, department = ? WHERE employeeID = ?', [first_name, baseSalary,job_title, allowance,department, employeeId]);
  
      // Handle successful update (e.g., redirect to employee list, display success message)
      res.redirect('/admin'); // Replace as needed
  
    } catch (error) {
      console.error('Error updating employee:', error);
      // Handle errors (e.g., display error message to user, log the error)
      res.status(500).send('Internal Server Error');
    }
  });
  router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
        return res.redirect('/admin');
      }
      res.redirect('/admin-login');
    });
  });

// Route to render the employee attendance page
router.get('/employee-attendance', async (req, res) => {
  try {
    // Set the number of records per page
    const limit = 5;
    // Get the current page from the query parameters (default to 1 if not specified)
    const page = parseInt(req.query.page) || 1;
    // Calculate the offset
    const offset = (page - 1) * limit;

    // Fetch the total number of attendance records
    const [[{ totalRecords }]] = await database.query('SELECT COUNT(*) as totalRecords FROM attendance_records');
    // Calculate the total number of pages
    const totalPages = Math.ceil(totalRecords / limit);

    // Fetch the attendance records for the current page
    const [attendanceRecords] = await database.query('SELECT * FROM attendance_records LIMIT ? OFFSET ?', [limit, offset]);
    const [leaveRequests] = await database.query('SELECT * FROM leave_requests');

    console.log(attendanceRecords);

    res.render('admin-attendance', { 
      attendanceRecords, 
      leaveRequests, 
      currentPage: page, 
      totalPages 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


// Route to handle editing attendance
router.post('/editAttendance', (req, res) => {
  const { employeeID, month, daysPresent, daysAbsent, overtimeHours } = req.body;

  // Find the attendance record and update it
  const record = attendanceRecords.find(rec => rec.employeeID === employeeID && rec.month === month);
  if (record) {
      record.daysPresent = parseInt(daysPresent);
      record.daysAbsent = parseInt(daysAbsent);
      record.overtimeHours = parseInt(overtimeHours);
  }

  res.redirect('/admin-attendance');
});
// Route to handle form submission and generate PDF report
router.post('/generateAttendanceReport', (req, res) => {
  const { reportMonth } = req.body;

  // Generate PDF report
  generatePDFReport(reportMonth, (pdfFilePath, error) => {
      if (error) {
          console.error('Error generating PDF:', error);
          return res.status(500).send('Error generating PDF report');
      }

      // Send the generated PDF as a downloadable file
      res.contentType('application/pdf');
      res.download(pdfFilePath, `Attendance_Report_${reportMonth}.pdf`, (err) => {
          if (err) {
              console.error('Error downloading file:', err);
              res.status(500).send('Error downloading file');
          } else {
              // Delete the generated PDF file after download
              fs.unlinkSync(pdfFilePath, (unlinkErr) => {
                  if (unlinkErr) {
                      console.error('Error deleting PDF:', unlinkErr);
                  }
              });
          }
      });
  });
});

async function generatePDFReport(reportMonth, callback) {
  const pdfDoc = new PDFDocument();
  const pdfFileName = `Attendance_Report_${reportMonth}.pdf`;
  const pdfFilePath = path.join(__dirname, pdfFileName);

  try {
    const [rows] = await database.execute('SELECT * FROM attendance_records WHERE month = ?', [reportMonth]);

    // Generate PDF content
    const writeStream = fs.createWriteStream(pdfFilePath);
    pdfDoc.pipe(writeStream);

    pdfDoc.font('Helvetica-Bold').fontSize(20).text(`Attendance Report for ${reportMonth}`, { align: 'center' });
    pdfDoc.moveDown();

    if (rows.length === 0) {
      pdfDoc.font('Helvetica').fontSize(14).text('No attendance records for this month.', { align: 'center' });
    } else {
      const tableTop = 150;
      const rowHeight = 30;
      const col1 = 50;
      const col2 = 150;
      const col3 = 250;
      const col4 = 350;
      const col5 = 450;

      // Draw table headers
      pdfDoc.font('Helvetica-Bold').fontSize(12);
      pdfDoc.text('Employee ID', col1, tableTop);
      pdfDoc.text('Month', col2, tableTop);
      pdfDoc.text('Days Present', col3, tableTop);
      pdfDoc.text('Days Absent', col4, tableTop);
      pdfDoc.text('Overtime Hours', col5, tableTop);

      // Draw horizontal line under headers
      pdfDoc.moveTo(col1, tableTop + 25).lineTo(col5 + 100, tableTop + 25).stroke();

      // Draw table rows
      pdfDoc.font('Helvetica').fontSize(12);
      rows.forEach((row, i) => {
        const yPos = tableTop + (i + 1) * rowHeight;

        pdfDoc.text(`${row.employee_id}`, col1, yPos);
        pdfDoc.text(`${row.month}`, col2, yPos);
        pdfDoc.text(`${row.daysPresent}`, col3, yPos);
        pdfDoc.text(`${row.daysAbsent}`, col4, yPos);
        pdfDoc.text(`${row.overtime_hours}`, col5, yPos);

        // Draw horizontal lines between rows
        pdfDoc.moveTo(col1, yPos + rowHeight - 5).lineTo(col5 + 100, yPos + rowHeight - 5).stroke();
      });
    }
    pdfDoc.end();

    writeStream.on('finish', () => {
      callback(pdfFilePath, null);
    });

    writeStream.on('error', (error) => {
      console.error('Error writing PDF file:', error);
      callback(null, error);
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    callback(null, error);
  }
}

router.get('/search', async (req, res) => {
  const { name, employeeID } = req.query;

  try {
    let query = 'SELECT * FROM employee_profile WHERE 1=1';
    const queryParams = [];

    if (name) {
      query += ' AND first_name LIKE ?';
      queryParams.push(`%${name}%`);
    }

    if (employeeID) {
      query += ' AND employeeID = ?';
      queryParams.push(employeeID);
    }

    const [results] = await database.query(query, queryParams);

    res.render('employee-search-results', { employees: results });
  } catch (error) {
    console.error('Error executing search:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/deductions', async(req, res) => {
  try {
      // Retrieve employees from the database
      const [deductions] = await database.query('SELECT * FROM employee_profile');
      res.render('deductions', { deductions: deductions });
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }

});
// Update employee allowances and deductions
router.put('/deductions/:id', (req, res) => {
  const employeeId = req.params.id;
  const { transport_insurance, medical_insurance, meal_insurance, retirement_insurance } = req.body;
  const query = `
    UPDATE employees 
    SET 
      transport_insurance = ?, 
      medical_insurance = ?, 
      meal_insurance = ?, 
      retirement_insurance = ? 
    WHERE 
      employee_id = ?
  `;
  database.query(query, [transport_insurance, medical_insurance, meal_insurance, retirement_insurance, employeeId], (err, results) => {
    if (err) {
      console.error('Error updating employee: ', err);
      res.status(500).json({ error: 'Error updating allowances & deductions' });
      return;
    }
    res.json({ message: 'Employee updated successfully' });
  });
});
module.exports= router
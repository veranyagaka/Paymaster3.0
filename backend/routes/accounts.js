const express =require('express');
const router =express.Router();
const path = require('path');
const pdf = require('html-pdf'); 
const database = require('../database.js')
const fs = require('fs');

router.get('/leave_application', (req, res) => {
    res.render('leave_application'); 
});

// Route to handle leave application form submission
router.post('/apply_leave', async (req, res) => {
    const { employee_id, leave_type, start_date, end_date } = req.body;

    try {
        // Insert the leave request into the database
        await database.query(
            'INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date) VALUES (?, ?, ?, ?)',
            [employee_id, leave_type, start_date, end_date]
        );
        database.release();
        
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
router.get('/employee/salary/:id/download', (req, res) => {
  const employeeId = parseInt(req.params.id, 10);
  console.log(employeeId);
  const employee = employees.find(emp => emp.id === employeeId);

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
router.get('/employee-attendance', (req, res) => {
    const employee = [{id: 1}];
    const record = [{id: 1}];
    const attendance = [{id: 1}];

    res.render('employee-attendance',{employee,record,attendance}); 
});
module.exports= router
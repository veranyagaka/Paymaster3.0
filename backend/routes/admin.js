const express =require('express');
const router =express.Router();
const path = require('path');
const database = require('../database.js')

router.get('/', (req, res) => {
    res.render('admin-dashboard'); 
});

router.get('/employees', async (req, res) => {
    try {
        // Retrieve employees from the database
        const [rows] = await database.query('SELECT * FROM employee_profile');
        res.render('admin.ejs', { employees: rows });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
  });
router.get('/attendance-records', async(req, res) => {
    try {
        // Retrieve employees from the database
        const [attendanceRecords] = await database.query('SELECT * FROM attendance_records');
        res.render('attendance-records', { attendanceRecords: attendanceRecords });
    } catch (err) {
        console.error(err);
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

  const { first_name, job_title, department } = req.body; // Destructure data from request body

  try {
    // Update employee data in the database
    await database.query('UPDATE employee_profile SET first_name = ?, job_title = ?, department = ? WHERE employeeID = ?', [first_name, job_title, department, employeeId]);

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

    const { first_name, job_title, department } = req.body; // Destructure data from request body
  
    try {
      // Update employee data in the database
      await database.query('UPDATE employee_profile SET first_name = ?, job_title = ?, department = ? WHERE employeeID = ?', [first_name, job_title, department, employeeId]);
  
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
module.exports= router
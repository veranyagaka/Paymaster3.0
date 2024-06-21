const express =require('express');
const router =express.Router();
const path = require('path');
const database = require('../database.js')

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
    const employeeId = req.params.employeeId;
  
    const { first_name, job_title, department } = req.body; // Destructure data from request body
  
    try {
      // Update employee data in the database
      await database.query('UPDATE employee_profile SET first_name = ?, job_title = ?, department = ? WHERE employeeID = ?', [first_name, job_title, department, employeeId]);
  
      // Handle successful update (e.g., redirect to employee list, display success message)
      res.redirect('/employee-profile'); // Replace as needed
  
    } catch (error) {
      console.error('Error updating profile:', error);
      // Handle errors (e.g., display error message to user, log the error)
      res.status(500).send('Internal Server Error');
    } 
  });
module.exports= router
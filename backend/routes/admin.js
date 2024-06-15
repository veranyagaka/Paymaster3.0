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
        const [attendanceRecords] = await database.query('SELECT * FROM attendance-records');
        res.render('attendance_records', { attendanceRecords: attendanceRecords });
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
module.exports= router
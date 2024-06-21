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
module.exports= router
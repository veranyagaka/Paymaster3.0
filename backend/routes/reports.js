const express = require('express');
const router = express.Router();
//const database = require('../database.js')
const connectToDatabase = require('../db.js');
const database = await connectToDatabase();
router.get('/reports', async (req, res) => {
  try {
    const [femaleEmployees] = await database.query('SELECT COUNT(*) as count FROM employee_test WHERE gender = "F"');
    console.log('Female Employees:', femaleEmployees); 
    const [maleEmployees] = await database.query('SELECT COUNT(*) as count FROM employee_test WHERE gender = "M"');
    const [availableEmployees] = await database.query('SELECT COUNT(*) as count FROM employee_test WHERE availability = "Available"');
    console.log('Available Employees:', availableEmployees); 

    const [onLeaveEmployees] = await database.query('SELECT COUNT(*) as count FROM employee_test WHERE availability = "On Leave"');

    res.render('reports', {
      femaleRatio: femaleEmployees[0].count,
      maleRatio: maleEmployees[0].count,
      availableCount: availableEmployees[0].count,
      onLeaveCount: onLeaveEmployees[0].count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});
module.exports = router;
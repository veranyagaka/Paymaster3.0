const express = require('express');
const router = express.Router();
//const database = require('../database.js')
const database = require('../db.js');

router.get('/', async (req, res) => {
  try {
    const [femaleEmployees] = await database.query('SELECT COUNT(*) as count FROM employee_profile WHERE gender = "F"');
    console.log('Female Employees:', femaleEmployees[0].count); 
    const [maleEmployees] = await database.query('SELECT COUNT(*) as count FROM employee_profile WHERE gender = "M"');
    const [notEmployees] = await database.query('SELECT COUNT(*) as count FROM employee_profile WHERE gender = "Prefer not to say"');

    const [availableEmployees] = await database.query('SELECT COUNT(*) as count FROM employee_profile WHERE availability = "Available"');
    console.log('Available Employees:', availableEmployees[0].count); 

    const [onLeaveEmployees] = await database.query('SELECT COUNT(*) as count FROM employee_profile WHERE availability = "On Leave"');

    // Fetch department counts
    const [recruitmentCount] = await database.query('SELECT COUNT(*) as count FROM employee_profile WHERE department = "Recruitment"');
    const [complianceCount] = await database.query('SELECT COUNT(*) as count FROM employee_profile WHERE department = "Compliance"');
    const [compensationCount] = await database.query('SELECT COUNT(*) as count FROM employee_profile WHERE department = "Compensation"');
    const [developmentCount] = await database.query('SELECT COUNT(*) as count FROM employee_profile WHERE department = "Development"');

    res.render('reports', {
      femaleRatio: femaleEmployees[0].count,
      maleRatio: maleEmployees[0].count,
      availableCount: availableEmployees[0].count,
      onLeaveCount: onLeaveEmployees[0].count,
      notEmployees: notEmployees[0].count,
      recruitmentCount: recruitmentCount[0].count,
      complianceCount: complianceCount[0].count,
      compensationCount: compensationCount[0].count,
      developmentCount: developmentCount[0].count
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});
module.exports = router;
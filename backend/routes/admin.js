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

// Dummy data for demonstration purposes
const attendanceRecords = [
  { employeeID: 'E001', month: '2023-06', daysPresent: 20, daysAbsent: 2, overtimeHours: 10 },
  { employeeID: 'E002', month: '2023-06', daysPresent: 18, daysAbsent: 4, overtimeHours: 5 }
];

const leave_Requests = [
  { id: 'L001', employeeID: 'E001', leaveType: 'Vacation', startDate: '2023-07-01', endDate: '2023-07-10', status: 'Pending' },
  { id: 'L002', employeeID: 'E002', leaveType: 'Sick Leave', startDate: '2023-07-05', endDate: '2023-07-07', status: 'Pending' }
];

// Route to render the employee attendance page
router.get('/employee-attendance', async(req, res) => {
  try {
    // Retrieve employees from the database
    const [leaveRequests] = await database.query('SELECT * FROM leave_requests');

    res.render('admin-attendance', { attendanceRecords, leaveRequests });
    //res.render('leave-requests', { leave_requests: leave_requests });
} catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
}  
//IMPORTANT COMMENTres.render('admin-attendance', { attendanceRecords, leaveRequests });
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
module.exports= router
const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// Calculate salary for an employee
router.post('/calculate/:employeeId', async (req, res) => {
    const { employeeId } = req.params;
    const { month, year } = req.body;

    try {
        // Fetch employee salary structure
        const [salaryStructure] = await pool.query('SELECT * FROM salary_structures WHERE employee_id = ?', [employeeId]);

        if (salaryStructure.length === 0) {
            return res.status(404).json({ error: 'Salary structure not found' });
        }

        const { base_salary, tax_rate } = salaryStructure[0];

        // Fetch employee attendance for the month
        const [attendanceRecords] = await pool.query('SELECT * FROM attendance WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ?', [employeeId, month, year]);

        let totalHoursWorked = 0;
        attendanceRecords.forEach(record => {
            totalHoursWorked += record.hours_worked;
        });

        // Calculate overtime pay (assuming 40 hours per week and 4 weeks per month)
        const regularHours = 160; // 40 hours * 4 weeks
        const overtimeHours = totalHoursWorked > regularHours ? totalHoursWorked - regularHours : 0;
        const overtimePay = overtimeHours * (base_salary / regularHours * 1.5); // 1.5 times regular hourly rate

        // Calculate gross salary
        const grossSalary = base_salary + overtimePay;

        // Calculate tax deductions
        const taxDeducted = grossSalary * (tax_rate / 100);

        // Calculate net salary
        const netSalary = grossSalary - taxDeducted;

        // Generate payslip
        const [result] = await pool.query(
            'INSERT INTO payslips (employee_id, month, year, gross_salary, net_salary, overtime_pay, tax_deducted, total_deductions) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [employeeId, month, year, grossSalary, netSalary, overtimePay, taxDeducted, taxDeducted]
        );

        res.status(201).json({ message: 'Salary calculated and payslip generated successfully', payslipId: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

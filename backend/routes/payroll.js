const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Get all payroll records
router.get('/employees', (req, res) => {
    db.query('SELECT * FROM employees', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Add a new payroll record
router.post('/employees', (req, res) => {
    const { name, position, salary, tax_info } = req.body;
    db.query('INSERT INTO employees (name, position, salary, tax_info) VALUES (?, ?, ?, ?)', [name, position, salary, tax_info], (err, result) => {
        if (err) throw err;
        res.status(201).json({ id: result.insertId, name, position, salary, tax_info });
    });
});

// Update a payroll record
router.put('/employees/:id', (req, res) => {
    const { id } = req.params;
    const { name, position, salary, tax_info } = req.body;
    db.query('UPDATE employees SET name = ?, position = ?, salary = ?, tax_info = ? WHERE id = ?', [name, position, salary, tax_info, id], (err) => {
        if (err) throw err;
        res.json({ message: 'Record updated successfully' });
    });
});

// Delete a payroll record
router.delete('/employees/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM employees WHERE id = ?', [id], (err) => {
        if (err) throw err;
        res.json({ message: 'Record deleted successfully' });
    });
});

module.exports = router;

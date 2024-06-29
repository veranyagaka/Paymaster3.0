const express =require('express');
const router =express.Router();
const path = require('path');

const ejs = require('ejs');
const pdf = require('html-pdf'); 


router.get('/payslip/:month/:year', (req, res) => {
    const payrollData = {
        month: 'June',
        year: '2024',
        employeeName: 'John Doe',
        employeeId: '123456',
        department: 'Engineering',
        earnings: [
            { description: 'Basic Salary', amount: '$4000' },
            { description: 'House Rent Allowance', amount: '$1000' },
        ],
        deductions: [
            { description: 'Tax', amount: '$500' },
            { description: 'Insurance', amount: '$100' },
        ],
        netPay: '$4400'
    };
    res.render('payroll-history', payrollData);
});

router.get('/download-payslip/:month/:year', (req, res) => {
    ejs.renderFile(path.join(__dirname, '../../frontend/views', 'payslip.ejs'), payrollData, (err, html) => {
        if (err) {
            console.error('Error rendering EJS:', err); // Log the detailed error
            return res.status(500).send('Error generating PDF');
        }

        pdf.create(html).toStream((err, stream) => {
            if (err) {
                console.error('Error creating PDF:', err); // Log the detailed error
                return res.status(500).send('Error generating PDF');
            }
            res.setHeader('Content-type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=payslip.pdf');
            stream.pipe(res);
        });
    });
});
module.exports= router
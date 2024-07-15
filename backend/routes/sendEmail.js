const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "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");
//async function sendEmail(to, subject, htmlContent) {
const msg = {
    to: 'vera.nyagaka@strathmore.edu',
    from: 'nyagakavera@gmail.com', // Replace with your verified sender
    subject: 'Hello there hh',
    html: '<h1>We did it!</h1>',
};
/*
async function sendEmail() {
    try {
        await sgMail.send(msg);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error.toString());
        throw new Error('Failed to send email');
    }
}*/
async function sendEmail(subject, message,employeeId) {
    const msg = {
      to: 'vera.nyagaka@strathmore.edu',
      from: 'nyagakavera@gmail.com', // Replace with your verified sender
      subject: subject,
      html: message + '<p>Employee ID: ' + employeeId + '</p>',
    };
  
    try {
      await sgMail.send(msg);
      console.log('Contact Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error.toString());
      throw new Error('Failed to send email');
    }
  }
/*sgMail
    .send(msg)
    .then(() => {
        console.log('Email sent successfully');
        // Handle any further logic after email is sent
    })
    .catch(err => {
        console.error('Failed to send email:', err);
        // Handle error condition
    });
    */
async function sendEmail2(email, subject, message,employeeID) {
        const msg = {
          to: email,
          from: 'nyagakavera@gmail.com', // Replace with your verified sender
          subject: subject,
          html: `
          <h1>${message}</h1>
          <p>Employee ID: ${employeeID}</p>
    <p>We are thrilled to have you on board. We believe you will be a valuable addition to our team. If you have any questions, feel free to reach out to your manager or HR.</p>
    <br> You can login to your account here: <a href="https://paymaster.onrender.com/login">Login to Paymaster</a>
    <br><p>Best Regards,<br>Paymaster Team</p>
        `, // Include employee ID in the message body
      };
      
        try {
          await sgMail.send(msg);
          console.log('Registration Email sent successfully');
        } catch (error) {
          console.error('Error sending email:', error.toString());
          throw new Error('Failed to send email');
        }
      }
async function sendEmail3(email,subject, message) {
        const msg = {
          to: email,
          from: 'nyagakavera@gmail.com', // Replace with your verified sender
          subject: subject,
          html: `
          <h1>${message}</h1>
          <p>We recently detected a new login to your PayMaster account.</p>
      <p><strong>If you recently signed in to your account, you can disregard this message.</strong></p>
      <p>However, if you did not initiate this login, we recommend taking the following steps to ensure the security of your account:</p>
      <ol>
        <li><strong>Change your password immediately.</strong> A strong password should be at least 12 characters long and include a combination of uppercase and lowercase letters, numbers, and symbols.</li>
        <li><strong>Review your recent login activity.</strong> You can access this information within your PayMaster account settings.</li>
        <li><strong>Enable two-factor authentication (2FA) for added security.</strong> This requires an additional verification step when logging in, such as a code sent to your phone.</li>
      </ol>
      <p>For your peace of mind, PayMaster prioritizes the security of your data. If you have any questions or concerns about this notification, please don't hesitate to contact our support team.</p>
      <p>Sincerely,</p>
      <p>The PayMaster Security Team</p>
        `,
      };
      
        try {
          await sgMail.send(msg);
          console.log('Login Email sent successfully');
        } catch (error) {
          console.error('Error sending email:', error.toString());
          throw new Error('Failed to send email');
        }
      }
async function sendPayrollNotification(employeeEmail, salaryAmount) {
        const subject = 'Your Monthly Payroll Information';
        const message = `
          <h1>Your Payroll Information for This Month</h1>
          <p>Dear Employee,</p>
          <p>Your salary for this month has been processed. The amount credited to your account is <strong>${salaryAmount}</strong>.</p>
          <p>If you have any questions regarding your salary, please contact the HR department.</p>
          <p>Best Regards,<br>Payroll Team</p>
        `;
        const msg = {
          to: employeeEmail,
          from: 'nyagakavera@gmail.com', // Replace with your verified sender
          subject: subject,
          html: message,
        };
      
        try {
          await sgMail.send(msg);
          console.log('Payroll Email sent successfully');
        } catch (error) {
          console.error('Error sending email:', error.toString());
          throw new Error('Failed to send payroll notification email');
        }
      }
module.exports = { sendEmail, sendEmail2, sendEmail3, sendPayrollNotification };

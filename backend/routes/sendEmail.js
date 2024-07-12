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
async function sendEmail(subject, message) {
    const msg = {
      to: 'vera.nyagaka@strathmore.edu',
      from: 'nyagakavera@gmail.com', // Replace with your verified sender
      subject: subject,
      html: message,
    };
  
    try {
      await sgMail.send(msg);
      console.log('Email sent successfully');
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
async function sendEmail3(subject, message, email) {
        const msg = {
          to: email,
          from: 'vera.nyagaka@strathmore.edu', // Replace with your verified sender
          subject: subject,
          html: `
          <h1>${message}</h1>
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
module.exports = { sendEmail, sendEmail2, sendEmail3 };

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "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");
//async function sendEmail(to, subject, htmlContent) {
const msg = {
    to: 'vera.nyagaka@strathmore.edu',
    from: 'nyagakavera@gmail.com', // Replace with your verified sender
    subject: 'Hello there hh',
    html: '<h1>We did it!</h1>',
};
async function sendEmail() {
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
module.exports = sendEmail;

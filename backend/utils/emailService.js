const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransporter({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send admission confirmation email
async function sendAdmissionConfirmation(email, studentName, admissionId) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Admission Application Received',
    html: `
      <h2>Dear ${studentName},</h2>
      <p>Your admission application has been received successfully.</p>
      <p>Your admission ID is: <strong>${admissionId}</strong></p>
      <p>We will review your application and update you on the status soon.</p>
      <br>
      <p>Best regards,<br>Admission Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Admission confirmation email sent');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Send status update email
async function sendStatusUpdate(email, studentName, admissionId, status) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Admission Status Update',
    html: `
      <h2>Dear ${studentName},</h2>
      <p>The status of your admission application (ID: ${admissionId}) has been updated.</p>
      <p>New status: <strong>${status}</strong></p>
      <br>
      <p>Best regards,<br>Admission Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Status update email sent');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

module.exports = {
  sendAdmissionConfirmation,
  sendStatusUpdate
}; 
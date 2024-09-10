const nodemailer = require('nodemailer');
const formData = require('form-data');
const Mailgun = require('mailgun.js');

const mailgun = new Mailgun(formData);

const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
});

const transporter = nodemailer.createTransport({
  host: "smtp.mailgun.org",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILGUN_USER,
    pass: process.env.MAILGUN_PASS,
  },
});

async function sendEmail({ to, subject, text, html }) {
  try {
    const domain = process.env.MAILGUN_DOMAIN;

    const response = await mg.messages.create(domain, {
      from: "Excited User <mailgun@" + domain + ">",
      to: [to], 
      subject, 
      text, 
      html, 
    });

    console.log('Message sent: ', response);
    return response; 
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
    
module.exports = {sendEmail,};
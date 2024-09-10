const nodemailer = require('nodemailer');

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
    const info = await transporter.sendMail({
      from: '"Maddison Foo Koch 👻" <mycomp@gmail.com>', 
      to, 
      subject, 
      text, 
      html, 
    });

    console.log("Message sent: %s", info.messageId);
    return info; 
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
    
module.exports = {sendEmail,};
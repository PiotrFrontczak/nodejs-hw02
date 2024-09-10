const express = require('express');
const { sendEmail } = require('../../email');
const router = express.Router();

router.post('/send', async (req, res, next) => {
  try {
    const { to, subject, text, html } = req.body;

    await sendEmail({
      to,
      subject,
      text,
      html,
    });

    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
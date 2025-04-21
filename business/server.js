const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors()); // Allow Netlify frontend to send requests

app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  let transporter = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 587,
    secure: false,
    auth: {
      user: "contact@techfluence.agency",
      pass: "YOUR_EMAIL_PASSWORD"
    }
  });

  try {
    await transporter.sendMail({
      from: '"Website Contact Form" <contact@techfluence.agency>',
      to: "contact@techfluence.agency",
      subject: `New message from ${name}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `
    });

    res.status(200).json({ message: "Message sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

app.listen(10000, () => {
  console.log("Server running on port 10000");
});

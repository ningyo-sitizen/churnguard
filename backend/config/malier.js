const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 15000,
});

transporter.verify((err, success) => {
  if (err) {
    console.log("SMTP ERROR:", err);
  } else {
    console.log("SMTP READY");
  }
});

module.exports = transporter;
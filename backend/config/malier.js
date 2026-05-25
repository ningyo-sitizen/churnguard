  const nodemailer = require("nodemailer");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  transporter.verify((err, success) => {
    if (err) {
      console.log("Email transporter error:", err);
    } else {
      console.log("Email server ready");
    }
  });

  module.exports = transporter;
const transporter = require("../config/malier");

const sendOtp = async (email, otp) => {
  await transporter.sendMail({
    from: `"ChurnGuard" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "OTP Verification Code",
    html: `
      <div style="font-family: Arial; text-align: center;">
        <h2>OTP Verification</h2>
        <p>Your OTP code is:</p>
        <h1 style="letter-spacing: 5px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `,
  });
};

module.exports = sendOtp;
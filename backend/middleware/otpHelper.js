const resend = require("../config/malier");

const sendOtp = async (email, otp) => {
  try {
    const data = await resend.emails.send({
      from: "No Reply <noreply@churnguard.online>",
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

    console.log("EMAIL SENT:", data);

  } catch (err) {
    console.log("RESEND ERROR:", err);
    throw err;
  }
};

module.exports = sendOtp;
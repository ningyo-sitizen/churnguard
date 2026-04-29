const sendOtp = require("../middleware/otpHelper");

exports.testOtp = async (req, res) => {
  const { email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    await sendOtp(email, otp);

    console.log("OTP sent:", otp);

    res.json({
      message: "OTP sent successfully",
      otp: otp,
    });

  } catch (err) {
    console.log("Email error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};
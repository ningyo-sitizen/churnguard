const sendOtp = require("../middleware/otpHelper");
const churnguard_con = require("../config/db");

exports.get_otp = async (req, res) => {
  const { email } = req.query;

  const otp = Math.floor(100000 + Math.random() * 900000);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  try {
    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }
    const [rows] = await churnguard_con.query(

      "SELECT * FROM otp_codes WHERE email = ?",
      [email]
    );
    if (rows.length > 0 && new Date() < rows[0].expires_at) {
      await churnguard_con.query(
        "DELETE FROM otp_codes WHERE email = ?",
        [email]
      );
    }

    if (rows.length > 0 && new Date() > rows[0].expires_at) {
      await churnguard_con.query(
        "DELETE FROM otp_codes WHERE email = ?",
        [email]
      );
    }
    await sendOtp(email, otp);

    console.log("OTP sent:", otp);
    await churnguard_con.query(
      `INSERT INTO otp_codes (email, otp_code, expires_at)
       VALUES (?, ?, ?)`,
      [email, otp, expiresAt]
    );

    return res.json({
      message: "OTP sent successfully"
    });

  } catch (err) {
    console.log("Email error:", err);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

exports.check_otp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const [result] = await churnguard_con.query(
      `DELETE FROM otp_codes 
       WHERE email = ? AND otp_code = ? AND expires_at > NOW()`,
      [email, otp]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "otp invalid or expired" });
    }

    return res.status(200).json({ message: "OTP valid" });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};


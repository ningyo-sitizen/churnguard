const sendOtp = require("../middleware/otpHelper");
const { churnguard_con } = require("../config");

exports.get_otp = async (req, res) => {
  const { email } = req.query;

  const otp = Math.floor(100000 + Math.random() * 900000);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  try {
    await sendOtp(email, otp);

    console.log("OTP sent:", otp);

    await churnguard_con.query(
      `INSERT INTO otp_codes (email, otp_code, expires_at)
       VALUES (?, ?, ?)`,
      [email, otp, expiresAt]
    );

    res.json({
      message: "OTP sent successfully",
      otp: otp,
    });

  } catch (err) {
    console.log("Email error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
}

exports.check_otp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const [rows] = await churnguard_con.query(
      "SELECT otp_code, expires_at FROM otp_codes WHERE email = ? AND otp_code = ?",
      [email, otp]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "otp invalid" })
    }
    if (new Date() > rows[0]?.expires_at) {
      await churnguard_con.query(
        "DELET FROM otp_codes where email = ? AND otp_code = ?", [email, otp]
      )
      return res.status(400).json({ message: "otp is expired" })
    }
    if (otp !== rows[0]?.otp) {
      return res.status(401).json({ message: "kode otp salah" })
    }

    await churnguard_con.query(
      "DELET FROM otp_codes where email = ? AND otp_code = ?", [email, otp]
    )

    return res.status(200).json({message: "berhasil kode otp benar"})

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
}
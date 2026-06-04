const sendOtp = require("../middleware/otpHelper");
const churnguard_con = require("../config/db");

exports.get_otp = async (req, res) => {
  console.log("getting otp")
  const { email } = req.query;

  try {

    if (!email) {

      return res.status(400).json({
        message: "Email required"
      });
    }
    const [activeRows] = await churnguard_con.query(
      `
      SELECT *
      FROM otp_codes
      WHERE email = ?
      AND status = 'active'
      ORDER BY id DESC
      LIMIT 1
      `,
      [email]
    );

    if (activeRows.length > 0) {

      const activeOtp = activeRows[0];

      const now = new Date();
      if (now < new Date(activeOtp.expires_at)) {

        return res.status(200).json({
          status: "success",
          message: "OTP already sent to email",
          expired_at: activeOtp.expires_at
        });
      }

      await churnguard_con.query(
        `
        UPDATE otp_codes
        SET status = 'expired'
        WHERE id = ?
        `,
        [activeOtp.id]
      );
    }

    const [attemptRows] = await churnguard_con.query(
      `
      SELECT COUNT(*) as total
      FROM otp_codes
      WHERE email = ?
      AND status = 'expired'
      AND DATE(created_at) = CURDATE()
      `,
      [email]
    );

    const totalExpiredToday = attemptRows[0].total;

    if (totalExpiredToday >= 5) {

      return res.status(429).json({
        message: "Too many OTP attempts today"
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    );

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );


    await sendOtp(email, otp);

    console.log("OTP sent:", otp);

    // =================================================
    // INSERT OTP
    // =================================================

    await churnguard_con.query(
      `
      INSERT INTO otp_codes
      (
        email,
        otp_code,
        expires_at,
        status,
        created_at
      )
      VALUES (?, ?, ?, ?, NOW())
      `,
      [
        email,
        otp,
        expiresAt,
        "active"
      ]
    );

    return res.status(200).json({
      status: "success",
      message: "OTP sent successfully",
      expired_at: expiresAt
    });

  } catch (err) {

    console.log("Email error:", err);

    return res.status(500).json({
      message: "Failed to send OTP"
    });
  }
};


exports.get_new_otp = async (req, res) => {
  console.log("getting new otp")
  const { email } = req.query;

  try {

    if (!email) {

      return res.status(400).json({
        status : "error",
        message: "Email required"
      });
    }

    // =================================================
    // EXPIRE OLD ACTIVE OTP
    // =================================================

    await churnguard_con.query(
      `
      UPDATE otp_codes
      SET status = 'expired'
      WHERE email = ?
      AND status = 'active'
      `,
      [email]
    );

    // =================================================
    // DAILY LIMIT
    // =================================================

    const [attemptRows] = await churnguard_con.query(
      `
      SELECT COUNT(*) as total
      FROM otp_codes
      WHERE email = ?
      AND status = 'expired'
      AND DATE(created_at) = CURDATE()
      `,
      [email]
    );

    const totalExpiredToday = attemptRows[0].total;

    if (totalExpiredToday >= 5) {

      return res.status(429).json({
        status: "message",
        message: "Too many OTP attempts today"
      });
    }

    // =================================================
    // GENERATE OTP
    // =================================================

    const otp = Math.floor(
      100000 + Math.random() * 900000
    );

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // =================================================
    // SEND EMAIL
    // =================================================

    await sendOtp(email, otp);

    console.log("NEW OTP sent:", otp);

    // =================================================
    // INSERT OTP
    // =================================================

    await churnguard_con.query(
      `
      INSERT INTO otp_codes
      (
        email,
        otp_code,
        expires_at,
        status,
        created_at
      )
      VALUES (?, ?, ?, ?, NOW())
      `,
      [
        email,
        otp,
        expiresAt,
        "active"
      ]
    );

    return res.status(200).json({
      status: "success",
      message: "New OTP sent successfully",
      expired_at: expiresAt
    });

  } catch (err) {

    console.log("NEW OTP ERROR:", err);

    return res.status(500).json({
      message: "Failed to send new OTP"
    });
  }
};

// =====================================================
// CHECK OTP
// =====================================================

exports.check_otp = async (req, res) => {
  console.log("checking otp")
  const { email, otp } = req.body;

  try {

    const [rows] = await churnguard_con.query(
      `
      SELECT *
      FROM otp_codes
      WHERE email = ?
      AND otp_code = ?
      AND status = 'active'
      ORDER BY id DESC
      LIMIT 1
      `,
      [email, otp]
    );

    if (rows.length === 0) {

      return res.status(400).json({
        message: "OTP invalid"
      });
    }

    const otpData = rows[0];

    const now = new Date();

    // =================================================
    // CHECK EXPIRED
    // =================================================

    if (now > new Date(otpData.expires_at)) {

      await churnguard_con.query(
        `
        UPDATE otp_codes
        SET status = 'expired'
        WHERE id = ?
        `,
        [otpData.id]
      );

      return res.status(400).json({
        message: "OTP expired"
      });
    }

    // =================================================
    // MARK USED
    // =================================================

    await churnguard_con.query(
      `
      UPDATE otp_codes
      SET status = 'used'
      WHERE id = ?
      `,
      [otpData.id]
    );

    return res.status(200).json({
      message: "OTP valid"
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

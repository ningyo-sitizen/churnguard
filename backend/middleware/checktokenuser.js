const jwt = require("jsonwebtoken");
const churnguard_con = require("../config/db");

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ NO TOKEN OR INVALID FORMAT");
      return res.status(401).json({
        message: "No token"
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token missing"
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      console.log("❌ JWT ERROR:", jwtErr.message);
      return res.status(401).json({
        message: "Invalid token"
      });
    }

    if (!decoded?.email) {
      return res.status(401).json({
        message: "Invalid token payload"
      });
    }

    let rows;
    try {
      const result = await churnguard_con.query(
        "SELECT * FROM users WHERE email = ?",
        [decoded.email]
      );
      rows = result[0];
    } catch (dbErr) {
      return res.status(500).json({
        message: "Database error"
      });
    }

    const user = rows[0];

    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan"
      });
    }
    if (decoded.sessionVersion !== user.session_version) {
      return res.status(401).json({
        message: "Session expired"
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        message: "Account disabled"
      });
    }
    req.user = user;

    next();

  } catch (err) {
    return res.status(500).json({
      message: "Auth middleware crash",
      error: err.message
    });
  }
};

module.exports = verifyToken;
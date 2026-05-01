const jwt = require("jsonwebtoken");
const churnguard_con = require("../config/db");

const verifyToken = async (req, res, next) => {
    console.log("STEP 1 - masuk middleware");
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json("No token");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("STEP 2 - JWT OK");

    const [rows] = await churnguard_con.query(
      "SELECT * FROM users WHERE email = ?",
      [decoded.email]
    );
    console.log("STEP 3 - query OK");
    const user = rows[0];

    if (!user) {
        console.log("STEP FAIL - user null");
      return res.status(404).json("User tidak ditemukan");
    }

    if (decoded.sessionVersion !== user.session_version) {
        console.log("STEP FAIL - sesi habbis");
      return res.status(401).json("Session expired");
    }

    if (!user.is_active) {
        console.log("STEP FAIL - user di ban");
      return res.status(403).json("Account disabled");
    }
    req.user = user;
    console.log("STEP 6 - role:", req.user.role);    next();

  } catch (err) {
    console.log("JWT ERROR:", err.message);
    return res.status(401).json("Invalid token");
  }
};

module.exports = verifyToken;
const jwt = require("jsonwebtoken");
const { churnguard_con } = require("../config");
const bcrypt = require('bcryptjs');

const jwt = require("jsonwebtoken");
const { churnguard_con } = require("../config");
const bcrypt = require("bcryptjs");

exports.ChurnGuardRegister = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const [existing] = await churnguard_con.query(
      "SELECT email FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const sessionVersion = 0;
    const role = "user";
    const avatar_url = "";

    await churnguard_con.query(
      `INSERT INTO users (name, email, password, role, avatar_url, session_version)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, hashed, role, avatar_url, sessionVersion]
    );

    const token = jwt.sign(
      {
        email,
        name,
        avatar: avatar_url,
        sessionVersion,
        role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      message: "Register success",
      token
    });

  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Database error" });
  }
};
exports.ChurnGuardLogin = async (req, res) => {

}
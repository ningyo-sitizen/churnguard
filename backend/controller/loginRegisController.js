const jwt = require("jsonwebtoken");
const churnguard_con = require("../config/db");
const bcrypt = require("bcryptjs");
const cloudinary = require("../config/cloud")

exports.validateImage = async (req,res) => {

}

exports.saveImage = async (req,res) => {
  
}

exports.update_user_profile = async (req, res) => {

  const email = req.user.email;

  const {
    name,
    nama_perusahaan,
    nama_app,
    link_app,
    avatar
  } = req.body;

  try {

    const [existing] = await churnguard_con.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        message: "user tidak ditemukan"
      });
    }

    await churnguard_con.query(
      `
      UPDATE users
      SET
        name = ?,
        nama_perusahaan = ?,
        nama_app = ?,
        link_app = ?,
        avatar_url = ?
      WHERE email = ?
      `,
      [
        name,
        nama_perusahaan,
        nama_app,
        link_app,
        avatar,
        email
      ]
    );

    const [updatedUser] = await churnguard_con.query(
      `
      SELECT
        name,
        email,
        nama_perusahaan,
        nama_app,
        link_app,
        avatar_url
      FROM users
      WHERE email = ?
      `,
      [email]
    );

    return res.status(200).json({
      message: "profile berhasil diupdate",
      user: {
        name: updatedUser[0].name,
        email: updatedUser[0].email,
        nama_perusahaan: updatedUser[0].nama_perusahaan,
        nama_app: updatedUser[0].nama_app,
        link_app: updatedUser[0].link_app,
        avatar: updatedUser[0].avatar_url
      }
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "server error"
    });

  }
};


exports.get_user_data = async (req, res) => {

  const email = req.user.email;

  try {

    const [existing] = await churnguard_con.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        message: "tidak ada user dengan data ini"
      });
    }

    const user_detail = {
      name: existing[0].name,
      nama_perusahaan: existing[0].nama_perusahaan,
      nama_app: existing[0].nama_app,
      link_app: existing[0].link_app,
      avatar: existing[0].avatar_url,
      email: existing[0].email
    };

    return res.status(200).json(user_detail);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "server error"
    });

  }
};

exports.ChurnGuardEmailCheck = async (req, res) => {
  const { email } = req.body;

  try {
    const [existing] = await churnguard_con.query(
      "SELECT email FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    return res.status(200).json({ message: "Email available" });

  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

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

    const sessionVersion = 1;
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
  const { email, pass } = req.body;

  if (!email || !pass) {
    return res.status(400).json({ message: "Email & password required" });
  }

  try {
    const [existing] = await churnguard_con.query(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );

    if (!existing || existing.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const userLogin = existing[0];

    const valid = await bcrypt.compare(pass, userLogin.password);

    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const sessionVersion = userLogin.session_version + 1;

    await churnguard_con.query(
      "UPDATE users SET session_version = ? WHERE email = ?",
      [sessionVersion, email]
    );

    const user = {
      email: userLogin.email,
      sessionVersion,
      role: userLogin.role
    };

    const token = jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });

    return res.status(200).json({
      message: "Login success",
      token
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Database error" });
  }
};
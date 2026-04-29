const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;

const mysql = require('mysql2/promise');
const path = require('path');
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const churnguard_con = mysql.createPool({
  host: process.env.DB_HOST_CHURNGUARD,
  user: process.env.DB_USER_CHURNGUARD,
  password: process.env.DB_PASS_CHURNGUARD,
  database: process.env.DB_DATABASE_CHURNGUARD,
  waitForConnections: true,
  connectionLimit: 10,
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/auth/google/callback"
},
(accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

module.exports = {passport,churnguard_con,transporter};
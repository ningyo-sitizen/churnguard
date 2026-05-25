const mysql = require("mysql2/promise");

const churnguard_con = mysql.createPool({
  host: process.env.DB_HOST_CHURNGUARD,
  user: process.env.DB_USER_CHURNGUARD,
  password: process.env.DB_PASS_CHURNGUARD,
  database: process.env.DB_DATABASE_CHURNGUARD,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = churnguard_con;

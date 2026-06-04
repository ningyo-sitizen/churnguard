const jwt = require("jsonwebtoken");
const churnguard_con = require("../config/db");

const checkrole = (role) => {
  return (req, res, next) => {

    if (req.user.role !== role) {
      return res.status(403).json("Forbidden");
    }
    next();
  };
};

module.exports = checkrole;
const jwt = require("jsonwebtoken");
const { churnguard_con } = require("../config");

const checkrole = (role) => {
  return (req, res, next) => {
    console.log("cek role:", req.user.role, "butuh:", role);

    if (req.user.role !== role) {
      return res.status(403).json("Forbidden");
    }

    next();
  };
};

module.exports = checkrole;
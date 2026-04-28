const express = require("express");
const passport = require("passport");
const router = express.Router();
const authController = require("../controller/passportController");

router.get("/google/login",
  passport.authenticate("google", {
    scope: ["email", "profile"],
    state: "login"
  })
);

router.get("/google/register",
  passport.authenticate("google", {
    scope: ["email", "profile"],
    state: "register"
  })
);

router.get("/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5173/login-register?error=cancelled"
  }),
  authController.googleCallback
);

module.exports = router;
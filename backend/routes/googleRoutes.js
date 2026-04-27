const express = require("express");
const passport = require("passport");
const router = express.Router();
const authController = require("../controller/passportController");

router.get("/google",
  passport.authenticate("google", {
    scope: ["email", "profile"]
  })
);

router.get("/google/callback",
  passport.authenticate("google", { session: false }),
  authController.googleCallback
);

module.exports = router;
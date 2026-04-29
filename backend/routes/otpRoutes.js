const express = require("express");
const router = express.Router();
const { testOtp } = require("../controller/otpCon")

router.post("/test-otp", testOtp);

module.exports = router;
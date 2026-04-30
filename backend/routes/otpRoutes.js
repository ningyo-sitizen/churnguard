const express = require("express");
const router = express.Router();
const { get_otp,check_otp } = require("../controller/otpCon")

router.post("/get-otp", get_otp);
router.post("/check-otp", check_otp)

module.exports = router;
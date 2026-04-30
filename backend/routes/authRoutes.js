const express = require("express");
const router = express.Router();
const {ChurnGuardEmailCheck} = require("../controller/loginRegisController")
const { get_otp } = require("../controller/otpCon")


router.post("/register/check",ChurnGuardEmailCheck)
router.get("/register/get-otp",get_otp)

module.exports = router;
const express = require("express");
const router = express.Router();
const {ChurnGuardEmailCheck,ChurnGuardRegister,ChurnGuardLogin} = require("../controller/loginRegisController")
const { get_otp,check_otp } = require("../controller/otpCon")


router.post("/register/check-email",ChurnGuardEmailCheck)
router.get("/register/get-otp",get_otp)
router.post("/register/check-otp", check_otp)
router.post("/register/newAcc",ChurnGuardRegister)
router.post("/login",ChurnGuardLogin)

module.exports = router;
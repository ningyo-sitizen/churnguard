const express = require("express");
const router = express.Router();
const {ChurnGuardEmailCheck,ChurnGuardRegister,ChurnGuardLogin,get_user_data,update_user_profile} = require("../controller/loginRegisController")
const { get_otp,check_otp } = require("../controller/otpCon")
const verifyToken = require('../middleware/checktokenuser');
const checkrole = require('../middleware/checkrole')

router.post("/register/check-email",ChurnGuardEmailCheck)
router.get("/register/get-otp",get_otp)
router.post("/register/check-otp", check_otp)
router.post("/register/newAcc",ChurnGuardRegister)
router.post("/login",ChurnGuardLogin)
router.get("/me",verifyToken,checkrole("user"),get_user_data)
router.put("/update-profile",verifyToken,checkrole("user"),update_user_profile)

module.exports = router;
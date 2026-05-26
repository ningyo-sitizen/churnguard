const express = require("express");
const router = express.Router();
const { ChurnGuardEmailCheck, ChurnGuardRegister, ChurnGuardLogin, get_user_data, update_user_profile,ChurnGuardEmailCheckForget,ChurnGuardPaymentHistory, ChurnGuardChagepass } = require("../controller/loginRegisController")
const { get_otp, check_otp, get_new_otp} = require("../controller/otpCon")
const verifyToken = require('../middleware/checktokenuser');
const checkrole = require('../middleware/checkrole')
const multer = require("multer");

const upload = multer({

    dest: "uploads/",

    limits: {
        fileSize: 2 * 1024 * 1024
    },

    fileFilter: (
        req,
        file,
        cb
    ) => {

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png"
        ];

        if (
            allowedTypes.includes(
                file.mimetype
            )
        ) {

            cb(null, true);

        } else {

            cb(
                new Error(
                    "Hanya JPG/JPEG"
                )
            );

        }

    }

});

router.post("/register/check-email", ChurnGuardEmailCheck)
router.post("/forget_pass/password", ChurnGuardChagepass)
router.get("/register/get-otp", get_otp)
router.get("/register/new-otp", get_new_otp)
router.post("/register/check-otp", check_otp)
router.post("/register/newAcc", ChurnGuardRegister)
router.post("/login", ChurnGuardLogin)
router.get("/me", verifyToken, checkrole("user"), get_user_data)
router.get("/meAdmin", verifyToken, checkrole("admin"), get_user_data)
router.get("/paymenthistory",verifyToken,checkrole("user"),ChurnGuardPaymentHistory)
router.put("/update-profile", verifyToken, checkrole("user"), upload.single("avatar"), update_user_profile)
router.post("/forgetpass/check-email",ChurnGuardEmailCheckForget)
module.exports = router;
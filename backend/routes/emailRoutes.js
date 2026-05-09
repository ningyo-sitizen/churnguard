const express = require("express")
const router = express.Router();
const {getGeneratedEmail,sendEmail} = require("../controller/reentantionController")


router.post("/generate",getGeneratedEmail)
router.post("/send",sendEmail)

module.exports = router;
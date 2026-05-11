const express = require("express")
const router = express.Router();
const {getGeneratedEmail,sendEmail,bulkSend} = require("../controller/reentantionController")


router.post("/generate",getGeneratedEmail)
router.post("/send",sendEmail)
router.post("/bulk-send",bulkSend)

module.exports = router;
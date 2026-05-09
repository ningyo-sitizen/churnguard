const express = require("express")
const router = express.Router();
const {getGeneratedEmail} = require("../controller/reentantionController")


router.post("/generate",getGeneratedEmail)

module.exports = router;
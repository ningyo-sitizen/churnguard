const express = require("express")
const router = express.Router()
const verifyToken = require('../middleware/checktokenuser');
const checkrole = require('../middleware/checkrole')
const {sendFeedback} = require('../controller/feedback')


router.post("/sendFeed",verifyToken,checkrole('user'),sendFeedback)

module.exports = router
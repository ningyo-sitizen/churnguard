const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/checktokenuser');
const {ping} = require("../controller/pingcon")
const checkrole = require('../middleware/checkrole')

router.get('/ping',verifyToken,checkrole("user"),ping);


module.exports = router;
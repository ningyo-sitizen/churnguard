const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/checktokenuser');
const {ping} = require("../controller/pingcon")


router.get('/ping',ping);


module.exports = router;
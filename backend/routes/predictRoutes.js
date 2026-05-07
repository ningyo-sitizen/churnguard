const express = require("express");
const router = express.Router();
const verifyToken = require('../middleware/checktokenuser');
const checkrole = require('../middleware/checkrole')
const {getPrediction} = require("../controller/predictionController")

router.get("/prediction-data",verifyToken,checkrole("user"),getPrediction)

module.exports = router;
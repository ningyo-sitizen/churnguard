const express = require("express");
const router = express.Router();
const verifyToken = require('../middleware/checktokenuser');
const checkrole = require('../middleware/checkrole')
const {getPrediction,getUserDetail} = require("../controller/predictionController")

router.get("/prediction-data",verifyToken,checkrole("user"),getPrediction)
router.get("/costumer-detail",verifyToken,checkrole("user"),getUserDetail)

module.exports = router;
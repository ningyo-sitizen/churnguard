const express = require("express");
const router = express.Router();
const verifyToken = require('../middleware/checktokenuser');
const checkrole = require('../middleware/checkrole')
const {getPrediction,getUserDetail,nosave,yessave,analytics,getPredictionHistory,getPredictionDashboardHistory} = require("../controller/predictionController")

router.get("/prediction-data",verifyToken,checkrole("user"),getPrediction)
router.get("/costumer-detail",verifyToken,checkrole("user"),getUserDetail)
router.post("/no-save",verifyToken,checkrole("user"),nosave)
router.post("/yes-save",verifyToken,checkrole("user"),yessave)
router.get("/analytics",analytics)
router.get("/history",getPredictionHistory)
router.get("/prediction-history",getPredictionDashboardHistory)
module.exports = router;
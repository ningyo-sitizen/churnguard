const express = require("express");
const router  = express.Router();
const {
    getFeedbackStats,
    getRevenueStats,
    getPredictionStats,
    getSummaryCards,
} = require("../controller/reportsController");

const verifyToken = require("../middleware/checktokenuser");
const checkrole = require("../middleware/checkrole")


router.get("/summary", verifyToken, checkrole('admin'),getSummaryCards);


router.get("/feedback", verifyToken, checkrole('admin'),getFeedbackStats);


router.get("/revenue", verifyToken, checkrole('admin'),getRevenueStats);

router.get("/prediction", verifyToken, checkrole('admin'),getPredictionStats);

module.exports = router;

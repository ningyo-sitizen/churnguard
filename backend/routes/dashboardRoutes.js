const express = require("express"); 
const router = express.Router();

const {
    getDashboardSummary,
    getDashboardCharts,
    getDashboardUserInfo
} = require("../controller/dashboardController");

const verifyToken = require('../middleware/checktokenuser');
const checkrole = require('../middleware/checkrole')

// GET /api/dashboard/summary
router.get("/summary", verifyToken,checkrole('admin'), getDashboardSummary);

// GET /api/dashboard/userInfo
router.get("/userInfo", verifyToken,checkrole('admin'), getDashboardUserInfo);

// GET /api/dashboard/charts?year=2025
router.get("/charts", verifyToken,checkrole('admin'), getDashboardCharts);

module.exports = router;
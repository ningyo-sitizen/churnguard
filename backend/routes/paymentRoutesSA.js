const express = require("express");
const router = express.Router();

const {getAllPayment} = require("../controller/paymentController");

const checktoken = require("../middleware/checktokenuser")
const checkrole = require("../middleware/checkrole")

router.get("/",checktoken, checkrole('admin'),getAllPayment);

module.exports = router;
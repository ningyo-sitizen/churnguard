const express = require("express");
const router = express.Router();
const multer = require("multer");
const { validateCSV } = require("../controller/csvcontroller");
const verifyToken = require('../middleware/checktokenuser');
const checkrole = require('../middleware/checkrole')

const upload = multer({ dest: "uploads/" });

router.post("/upload-csv",verifyToken,checkrole("user"), upload.single("file"), validateCSV);

module.exports = router;
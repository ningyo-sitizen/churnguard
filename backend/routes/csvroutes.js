const express = require("express");
const router = express.Router();
const multer = require("multer");
const { validateCSV,sendToPython } = require("../controller/csvcontroller");
const verifyToken = require('../middleware/checktokenuser');
const checkrole = require('../middleware/checkrole')

const upload = multer({ dest: "uploads/" });

router.post("/upload-csv",verifyToken,checkrole("user"), upload.single("file"), validateCSV);
router.post(
  "/upload-csv-py",
  upload.single("file"),
  sendToPython
);
module.exports = router;
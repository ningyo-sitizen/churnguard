const express = require("express");
const router = express.Router();
const multer = require("multer");
const { validateCSV, sendToPython } = require("../controller/csvcontroller");
const verifyToken = require('../middleware/checktokenuser');
const checkrole = require('../middleware/checkrole')

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 15 * 1024 * 1024 }
});

router.post("/upload-csv",verifyToken,checkrole("user"),
  (req, res) => {

    upload.single("file")(req, res, async (err) => {

      if (err instanceof multer.MulterError) {

        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            status: "error",
            message: "File terlalu besar. Maksimal 15MB"
          });
        }
        return res.status(400).json({
          status: "error",
          message: err.message
        });
      }
      if (err) {
        return res.status(500).json({
          status: "error",
          message: "Upload gagal"
        });
      }

      return validateCSV(req, res);

    });

  }
);
router.post("/upload-csv-py", verifyToken, checkrole("user"), upload.single("file"), sendToPython);
module.exports = router;
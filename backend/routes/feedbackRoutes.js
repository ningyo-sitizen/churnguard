const express = require("express");
const router  = express.Router();

const {
    getAllFeedback,
    getFeedbackById,
    createFeedback,
    deleteFeedback,
    getFeedbackSummary,
} = require("../controller/feedbackController"); 

const verifyToken = require("../middleware/checktokenuser");
const checkrole = require("../middleware/checkrole")

router.post("/", createFeedback);

router.get("/", verifyToken,checkrole('admin'), getAllFeedback);

router.get("/summary", verifyToken,checkrole('admin'), getFeedbackSummary);

router.get("/:id", verifyToken,checkrole('admin'), getFeedbackById);

router.delete("/:id", verifyToken,checkrole('admin'), deleteFeedback);

module.exports = router;
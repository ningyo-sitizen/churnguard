const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/checktokenuser');
const checkrole = require("../middleware/checkrole")
const { getLogs, createLog, deleteLog } = require('../controller/loggercontrollerSA');

router.get('/logging', verifyToken, checkrole('admin'), getLogs);
router.post('/logging', verifyToken, checkrole('admin'), createLog);
router.delete('/logging/:id', verifyToken, checkrole('admin'), deleteLog);

module.exports = router;
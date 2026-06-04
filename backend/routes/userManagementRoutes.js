const express = require("express");
const router  = express.Router();

const { getAllUsers, getAllAdmins, getUserById, toggleBanAdmin, toggleBanUser, deleteUser, createAdmin } =
    require("../controller/userManagementController");


const verifyToken = require('../middleware/checktokenuser');
const checkrole = require('../middleware/checkrole')


router.get("/users", verifyToken,checkrole('admin') ,getAllUsers);
router.get("/admins",verifyToken,checkrole('admin') , getAllAdmins);

router.get("/users/:id",verifyToken,checkrole('admin') ,getUserById);

router.patch("/users/:id/ban",verifyToken,checkrole('admin') ,toggleBanUser);
router.patch("/admins/:id/ban",verifyToken,checkrole('admin') ,toggleBanAdmin);

router.delete("/users/:id",verifyToken,checkrole('admin') ,deleteUser);
router.post("/users/newadmin",verifyToken,checkrole('admin') ,createAdmin);

module.exports = router;

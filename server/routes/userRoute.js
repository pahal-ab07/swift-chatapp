const express = require('express');
const registerController = require('../controllers/registerController');
const loginController = require('../controllers/loginController');
const logoutController = require('../controllers/logoutController');
const verifyEmail = require('../controllers/emailVerifyController');
const { profileController, profileUpdate } = require("../controllers/profileController");
const messageController = require("../controllers/messageController");
const peopleController = require("../controllers/peopleController");
const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/logout", logoutController);
router.get("/:id/verify/:token", verifyEmail);
router.get("/profile", profileController);
router.get("/messages/:userId", messageController);
router.get("/people", peopleController);
router.put("/profile/update", profileUpdate);

module.exports = router;
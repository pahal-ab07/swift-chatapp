const express = require("express");
const {
  avatarController,
  getAllAvatars,
} = require("../controllers/avatarController");

const router = express.Router();

// Route for adding a new avatar
router.post("/add", avatarController);

// Route for getting all avatars
router.get("/all", getAllAvatars);

module.exports = router;

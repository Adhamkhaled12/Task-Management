const express = require("express");
const { registerUser } = require("../controllers/userController");
const { validateRequest } = require("../middleware/validateMiddleware");
const { body } = require("express-validator");

const router = express.Router();

router.post(
  "/register",
  body("name").notEmpty(),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  validateRequest,
  registerUser
);

module.exports = router;

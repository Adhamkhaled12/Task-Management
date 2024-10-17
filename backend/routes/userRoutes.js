const express = require("express");
const {
  registerUser,
  loginUser,
  getUsers,
  deleteUser,
} = require("../controllers/userController");
const { validateRequest } = require("../middleware/validateMiddleware");
const { body } = require("express-validator");
const { authorizeRole } = require("../middleware/roleMiddleware");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/register",
  body("name").notEmpty(),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  validateRequest,
  registerUser
);

router.post(
  "/login",
  body("email").isEmail(),
  body("password").notEmpty(),
  validateRequest,
  loginUser
);

router.get("/all-users", authenticate, authorizeRole("admin"), getUsers);

router.delete("/:id", authenticate, authorizeRole("admin"), deleteUser);

module.exports = router;

const express = require("express");
const {
  registerUser,
  verifyEmail,
  loginUser,
  getUsers,
  deleteUser,
  requestPasswordReset,
  resetPassword,
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

// Email verification route
router.get("/verify-email", verifyEmail);

router.post(
  "/login",
  body("email").isEmail(),
  body("password").notEmpty(),
  validateRequest,
  loginUser
);

router.get("/all-users", authenticate, authorizeRole("admin"), getUsers);

router.delete("/:id", authenticate, authorizeRole("admin"), deleteUser);

// Request password reset
router.post("/request-password-reset", requestPasswordReset);

// password reset
router.post(
  "/reset-password",
  [
    body("newPassword")
      .notEmpty()
      .withMessage("New password is required.")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long."),
  ],
  validateRequest,
  resetPassword
);

module.exports = router;

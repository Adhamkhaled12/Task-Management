const express = require("express");
const { validateRequest } = require("../middleware/validateMiddleware");
const { authorizeRole } = require("../middleware/roleMiddleware");
const { authenticate } = require("../middleware/authMiddleware");
const {
  registerUser,
  verifyEmail,
  loginUser,
  getUsers,
  deleteUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");
const {
  registerValidator,
  loginValidator,
  resetPasswordValidator,
} = require("../middleware/userValidator");

const router = express.Router();

router.post("/register", registerValidator, validateRequest, registerUser);

router.get("/verify-email", verifyEmail);

router.post("/login", loginValidator, validateRequest, loginUser);

router.get("/", authenticate, authorizeRole("admin"), getUsers);

router.delete("/:id", authenticate, authorizeRole("admin"), deleteUser);

router.post("/password-reset", forgotPassword);

router.post(
  "/reset-password",
  resetPasswordValidator,
  validateRequest,
  resetPassword
);

module.exports = router;

const { body } = require("express-validator");

const registerValidator = [
  body("name").notEmpty().withMessage("Name is required."),
  body("email").isEmail().withMessage("Invalid email address."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
];

const loginValidator = [
  body("email").isEmail().withMessage("Invalid email address."),
  body("password").notEmpty().withMessage("Password is required."),
];

const resetPasswordValidator = [
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required.")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
];

module.exports = {
  registerValidator,
  loginValidator,
  resetPasswordValidator,
};

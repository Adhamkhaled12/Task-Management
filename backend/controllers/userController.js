const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

//@desc Register new user
//@route POST /api/users/register
//@access Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already Exist!");
  }

  // Create verification token (hex string) with a 12-hour expiration
  const verificationToken = crypto.randomBytes(20).toString("hex");
  const verificationExpires = Date.now() + 12 * 60 * 60 * 1000; // 12 hours

  // Hash Password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  // Create User
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    verificationToken,
    verificationExpires,
  });
  // Generate verification link
  const verificationLink = `http://localhost:5000/api/users/verify-email?token=${verificationToken}`;
  // Send verification email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Verify Your Email",
    text: `Please verify your email by clicking the following link: ${verificationLink}`,
  };

  await transporter.sendMail(mailOptions);

  res
    .status(201)
    .json({ message: "User registered. Check your email to verify." });
});

//@desc Verify email address using the token
//@route GET /api/users/verify-email
//@access Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  const user = await User.findOne({
    verificationToken: token,
    verificationExpires: { $gt: Date.now() }, // Ensure token is not expired
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired token.");
  }

  // Mark email as verified and clear token fields
  user.emailVerified = true;
  user.verificationToken = undefined;
  user.verificationExpires = undefined;

  await user.save();

  res.json({ message: "Email verified successfully." });
});

//@desc Authenticate a User
//@route POST /api/users/login
//@access Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // Check for user email
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    if (!user.emailVerified) {
      res.status(400);
      throw new Error("Please verify your email before logging in.");
    }
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid Credentials");
  }
});

//@desc Get Users
//@route GET /api/users/all-users
//@access Private
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
});

//@desc Delete User
//@route DELETE /api/users/:id
//@access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find the user by ID
  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  // Delete user
  await user.deleteOne();
  res.status(200).json({ message: "User deleted successfully." });
});

//@desc Request password reset
//@route POST /api/users/request-password-reset
//@access Public
const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  // Generate a reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Set the token and expiration date in the user model
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();

  // Send the reset token via email
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Password Reset Request",
    text: `You requested a password reset. Use the following token: ${resetToken}. This token is valid for 1 hour.`,
  };
  await transporter.sendMail(mailOptions);
  return res
    .status(200)
    .json({ message: "Password reset token sent to your email" });
});

//@desc Reset user password
//@route POST /api/users/reset-password
//@access Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.query;
  const { newPassword } = req.body;

  // Find the user with the token
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }, // Check if token is not expired
  });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Hash the new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);

  // Clear the reset token fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();
  res.json({ message: "Password has been reset successfully." });
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  getUsers,
  deleteUser,
  requestPasswordReset,
  resetPassword,
};

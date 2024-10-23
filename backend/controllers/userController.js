const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const { User } = require("../models/userModel");
const { Task } = require("../models/taskModel");
const { generateToken, sendEmail, generateOTP } = require("../utils/utils");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const redis = require("../config/redis");

//@desc Register new user
//@route POST /api/users/register
//@access Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  // Check if user exists
  let user = await User.findOne({ email });
  if (user) {
    res.status(400);
    throw new Error("User already Exist!");
  }
  user = new User({
    name,
    email,
    role,
  });

  user.password = await user.hashPassword(password);

  await user.save();

  const otp = generateOTP();
  await redis.set(`otp:${user._id}`, otp, "EX", 600); // 10 minutes

  await sendEmail({
    from: process.env.EMAIL,
    to: user.email,
    subject: "Your OTP code",
    text: `Your OTP is: ${otp}`,
  });

  res.status(201).json({
    message:
      "User registered successfully. Please verify your account using the OTP.",
    userId: user._id,
  });
});

//@desc Verify OTP for registration
//@route POST /api/users/verify-otp
//@access Public
const verifyOTP = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;

  // Retrieve OTP from Redis
  const storedOTP = await redis.get(`otp:${userId}`);
  if (!storedOTP) {
    res.status(400);
    throw new Error("OTP has expired.");
  }

  await redis.del(`otp:${userId}`);
  if (storedOTP !== otp) {
    res.status(400);
    throw new Error("Invalid OTP.");
  }
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }
  user.emailVerified = true;
  await user.save();

  res.status(200).json({ message: "Account verified successfully." });
});

//@desc Authenticate a User
//@route POST /api/users/login
//@access Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401);
    throw new Error("Invalid credentials.");
  }

  if (!user.emailVerified) {
    res.status(403);
    throw new Error("Verify your email before logging in.");
  }
  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  });
});

//@desc Get Users
//@route GET /api/users
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
  // Validate ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid User ID.");
  }

  // Start a session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(id).session(session);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    // Delete all tasks associated with the user
    await Task.deleteMany({ user: user._id }).session(session);
    // Delete user
    await user.deleteOne({ session });

    // Commit the transaction
    await session.commitTransaction();
    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    // If any error occurs, abort the transaction
    await session.abortTransaction();
    throw new Error(error.message || "Failed to delete user.");
  } finally {
    session.endSession();
  }
});

//@desc Request password reset
//@route POST /api/users/password-reset
//@access Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  // Get existing token for user if exists
  const existingToken = await redis.get(`resetPassword:email:${user.email}`);
  if (existingToken) {
    await redis.del(`resetPassword:token:${existingToken}`);
    await redis.del(`resetPassword:email:${user.email}`);
  }

  // Generate new reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Store both mappings with clear key patterns
  await redis.set(`resetPassword:token:${resetToken}`, user._id, "EX", 3600);
  await redis.set(`resetPassword:email:${user.email}`, resetToken, "EX", 3600);

  await sendEmail({
    from: process.env.EMAIL,
    to: email,
    subject: "Password Reset Request",
    text: `You requested a password reset. Use the following token: ${resetToken}. This token is valid for 1 hour.`,
  });

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

  // Retrieve the user ID from Redis
  const userId = await redis.get(`resetPassword:token:${token}`);

  if (!userId) {
    res.status(400);
    throw new Error("Invalid or expired token");
  }
  // Find the user by ID
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.password = await user.hashPassword(newPassword);
  await user.save();

  await redis.del(`resetPassword:token:${token}`);
  await redis.del(`resetPassword:email:${user.email}`);

  res.status(200).json({ message: "Password has been reset successfully." });
});

module.exports = {
  registerUser,
  verifyOTP,
  loginUser,
  getUsers,
  deleteUser,
  forgotPassword,
  resetPassword,
};

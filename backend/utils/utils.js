const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
};

// Helper to generate random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = asyncHandler(async (options) => {
  await transporter.sendMail(options);
});

module.exports = { generateToken, sendEmail, generateOTP };

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  emailVerified: { type: Boolean, default: false },
});

userSchema.methods.hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const User = mongoose.model("User", userSchema);

module.exports = { User };

const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "In-Progress", "Done"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    },
    category: {
      type: String,
      enum: ["Work", "Personal"],
      required: true,
    },
    dueDate: { type: Date, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ status: 1, priority: 1, dueDate: 1 });

const Task = mongoose.model("Task", taskSchema);

module.exports = { Task };

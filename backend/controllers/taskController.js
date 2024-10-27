const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const { Task } = require("../models/taskModel");
const { AuditLog } = require("../models/auditLogModel");

//@desc Create new task
//@route POST /api/tasks
//@access Private
const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, category, dueDate } = req.body;
  const task = await Task.create({
    title,
    description,
    status,
    priority,
    category,
    dueDate,
    user: req.user._id,
  });
  // If task is successfully created
  res.status(201).json({
    id: task._id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    category: task.category,
    dueDate: task.dueDate,
  });
});

//@desc Get tasks
//@route GET /api/tasks?status=Pending&priority=High&sortBy=dueDate&page=1&limit=10
//@access Private
const getTasks = asyncHandler(async (req, res) => {
  const {
    status,
    priority,
    category,
    sortBy,
    page = 1,
    limit = 10,
  } = req.query;

  // Create filter object
  const filter = { user: req.user._id };
  // if provided add them to the filter
  if (status) {
    filter.status = status;
  }

  if (priority) {
    filter.priority = priority;
  }

  if (category) {
    filter.category = category;
  }

  const sort = {};
  // set the key sortBy to the value 1 to sort in ascending order
  if (sortBy) sort[sortBy] = 1;

  const tasks = await Task.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json(tasks);
});

//@desc Update task by id
//@route PATCH /api/tasks/:id
//@access Private
const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const oldTask = await Task.findOne({ _id: id, user: req.user._id }, null, {
      session,
    });

    if (!oldTask) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Task not found." });
    }

    const modifiedFieldsLog = Object.entries(updates).reduce(
      (acc, [key, newValue]) => {
        const oldValue = oldTask[key];
        const isModified =
          oldValue instanceof Date
            ? oldValue.getTime() !== new Date(newValue).getTime()
            : oldValue !== newValue;

        if (isModified) {
          acc.push({ field: key, oldValue, newValue });
        }
        return acc;
      },
      []
    );

    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, user: req.user._id },
      updates,
      { new: true, session }
    );

    if (modifiedFieldsLog.length > 0) {
      const auditLogEntry = {
        taskId: id,
        modifiedBy: req.user._id,
        changeType: "Task updated",
        updates: modifiedFieldsLog,
        timestamp: new Date(),
      };

      await AuditLog.create([auditLogEntry], { session });
    }

    await session.commitTransaction();
    res.status(200).json(updatedTask);
  } catch (error) {
    await session.abortTransaction();
    console.error("Transaction failed:", error);
    res
      .status(500)
      .json({ message: "Failed to update task. " + error.message });
  } finally {
    session.endSession();
  }
});

//@desc Delete task by id
//@route DELETE /api/tasks/:id
//@access Private
const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const task = await Task.findOne({ _id: id, user: req.user._id }, null, {
      session,
    });

    if (!task) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Task not found." });
    }

    await Task.findOneAndDelete({ _id: id, user: req.user._id }, { session });

    const auditLogEntry = {
      taskId: id,
      modifiedBy: req.user._id,
      changeType: "Task deleted",
      updates: [
        { field: "title", oldValue: task.title, newValue: null },
        { field: "description", oldValue: task.description, newValue: null },
        { field: "status", oldValue: task.status, newValue: null },
        { field: "priority", oldValue: task.priority, newValue: null },
        { field: "category", oldValue: task.category, newValue: null },
        { field: "dueDate", oldValue: task.dueDate, newValue: null },
      ],
      timestamp: new Date(),
    };

    await AuditLog.create([auditLogEntry], { session });

    await session.commitTransaction();
    res.status(200).json({ message: "Task deleted successfully." });
  } catch (error) {
    await session.abortTransaction();
    console.error("Transaction failed:", error);
    res
      .status(500)
      .json({ message: "Failed to delete task. " + error.message });
  } finally {
    session.endSession();
  }
});

//@desc Get task history
//@route GET /api/tasks/:id/history
//@access Private
const getTaskHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // Retrieve audit logs for the task
  const history = await AuditLog.find({ taskId: id })
    .populate("modifiedBy", "name email")
    .sort({ timestamp: -1 });
  if (!history || history.length === 0) {
    return res.status(404).json({ message: "No history found for this task." });
  }
  res.status(200).json(history);
});

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getTaskHistory,
};

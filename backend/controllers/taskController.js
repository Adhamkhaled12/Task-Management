const asyncHandler = require("express-async-handler");
const Task = require("../models/taskModel");

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
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;

  const sort = {};
  // set the key sortBy to the value 1 which will sort in ascending order
  if (sortBy) sort[sortBy] = 1;

  const tasks = await Task.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.json(tasks);
});

//@desc Update task by id
//@route PUT /api/tasks/:id
//@access Private
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true }
  );

  if (!task) return res.status(404).json({ message: "Task not found." });
  res.json(task);
});

//@desc Delete task by id
//@route DELETE /api/tasks/:id
//@access Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.status(200).json({ message: "Task deleted successfully." });
});

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};

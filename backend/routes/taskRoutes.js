const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateMiddleware");
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const {
  createTaskValidator,
  getTasksValidator,
  updateTaskValidator,
} = require("../middleware/taskValidator");

const router = express.Router();

router.post(
  "/",
  authenticate,
  createTaskValidator,
  validateRequest,
  createTask
);

router.get("/", authenticate, getTasksValidator, validateRequest, getTasks);

router.patch(
  "/:id",
  authenticate,
  updateTaskValidator,
  validateRequest,
  updateTask
);

router.delete("/:id", authenticate, deleteTask);

module.exports = router;

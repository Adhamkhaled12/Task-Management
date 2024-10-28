const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateMiddleware");
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getTaskHistory,
  archiveTask,
  getArchivedTasks,
  restoreArchivedTask,
} = require("../controllers/taskController");
const {
  createTaskValidator,
  getTasksValidator,
  updateTaskValidator,
  deleteTaskValidator,
  archiveTaskValidator,
  restoreArchivedTaskValidator,
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

router.delete(
  "/:id",
  authenticate,
  deleteTaskValidator,
  validateRequest,
  deleteTask
);

router.get("/:id/history", authenticate, getTaskHistory);

router.patch(
  "/:id/archive",
  authenticate,
  archiveTaskValidator,
  validateRequest,
  archiveTask
);

router.get("/archived", authenticate, getArchivedTasks);

router.patch(
  "/:id/restore",
  authenticate,
  restoreArchivedTaskValidator,
  validateRequest,
  restoreArchivedTask
);

module.exports = router;

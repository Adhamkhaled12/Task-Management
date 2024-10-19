const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const { validateRequest } = require("../middleware/validateMiddleware");
const { body, query } = require("express-validator");

const router = express.Router();

router.post(
  "/",
  authenticate,
  [
    body("title").notEmpty().withMessage("Task title is required"),
    body("description")
      .notEmpty()
      .isString()
      .withMessage("Description must be a non-empty string"),
    body("status")
      .customSanitizer(
        (value) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
      )
      .isIn(["Pending", "In-Progress", "Done"])
      .withMessage(
        "Invalid status. Accepted values are: Pending, In-Progress, Done"
      ),
    body("priority")
      .customSanitizer(
        (value) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
      )
      .isIn(["Low", "Medium", "High"])
      .withMessage("Invalid priority. Accepted values are: Low, Medium, High"),
    body("category")
      .customSanitizer(
        (value) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
      )
      .isIn(["Work", "Personal"])
      .withMessage("Invalid category. Accepted values are: Work, Personal"),
    body("dueDate").notEmpty().isISO8601().withMessage("Invalid date format"),
  ],
  validateRequest,
  createTask
);

router.get(
  "/",
  authenticate,
  [
    query("status").optional().isIn(["Pending", "In-Progress", "Done"]),
    query("priority").optional().isIn(["Low", "Medium", "High"]),
    query("category").optional().isString(),
    query("sortBy").optional().isString().withMessage("Invalid sort field"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be at least 1"),
    query("limit")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Limit must be at least 1"),
  ],
  validateRequest,
  getTasks
);

router.put(
  "/:id",
  authenticate,
  [
    body("title").notEmpty().withMessage("Task title is required"),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),
    body("status")
      .isIn(["Pending", "In-Progress", "Done"])
      .withMessage("Invalid status"),
    body("priority")
      .isIn(["Low", "Medium", "High"])
      .withMessage("Invalid priority"),
    body("category")
      .optional()
      .isString()
      .withMessage("Category must be a string"),
    body("dueDate").optional().isISO8601().withMessage("Invalid date format"),
  ],
  validateRequest,
  updateTask
);

router.delete("/:id", authenticate, deleteTask);

module.exports = router;

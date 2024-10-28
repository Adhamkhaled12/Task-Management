const { body, query, param } = require("express-validator");

const createTaskValidator = [
  body("title").notEmpty().withMessage("Task title is required"),
  body("description")
    .notEmpty()
    .isString()
    .withMessage("Description must be a non-empty string"),
  body("status")
    .isIn(["Pending", "In-Progress", "Done"])
    .withMessage(
      "Invalid status. Accepted values are: Pending, In-Progress, Done"
    ),
  body("priority")
    .isIn(["Low", "Medium", "High"])
    .withMessage("Invalid priority. Accepted values are: Low, Medium, High"),
  body("category")
    .isIn(["Work", "Personal"])
    .withMessage("Invalid category. Accepted values are: Work, Personal"),
  body("dueDate").notEmpty().isISO8601().withMessage("Invalid date format"),
];

const getTasksValidator = [
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
];

const updateTaskValidator = [
  param("id").isMongoId().withMessage("Invalid task ID."),
  body("title").optional().notEmpty().withMessage("Task title is required"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  body("status")
    .optional()
    .isIn(["Pending", "In-Progress", "Done"])
    .withMessage(
      "Invalid status. Accepted values are: Pending, In-Progress, Done"
    ),
  body("priority")
    .optional()
    .isIn(["Low", "Medium", "High"])
    .withMessage("Invalid priority. Accepted values are: Low, Medium, High"),
  body("category")
    .optional()
    .isIn(["Work", "Personal"])
    .withMessage("Invalid category. Accepted values are: Work, Personal"),
  body("dueDate").optional().isISO8601().withMessage("Invalid date format"),
];

const deleteTaskValidator = [
  param("id").isMongoId().withMessage("Invalid task ID."),
];

const archiveTaskValidator = [
  param("id").isMongoId().withMessage("Invalid task ID."),
];

const restoreArchivedTaskValidator = [
  param("id").isMongoId().withMessage("Invalid task ID."),
];

module.exports = {
  createTaskValidator,
  getTasksValidator,
  updateTaskValidator,
  deleteTaskValidator,
  archiveTaskValidator,
  restoreArchivedTaskValidator,
};

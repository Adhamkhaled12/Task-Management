const express = require("express");
const colors = require("colors");
const dotenv = require("dotenv").config();
const helmet = require("helmet");
const cors = require("cors");
const { errorHandler } = require("./middleware/errorMiddleware");
const connectDB = require("./config/db");
const port = process.env.PORT || 5000;

const users = require("./routes/userRoutes");
const tasks = require("./routes/taskRoutes");

connectDB();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/users", users);
app.use("/api/tasks", tasks);

app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));

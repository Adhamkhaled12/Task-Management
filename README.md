# Task Management API

Task Management API that allows users to create, view, update, delete, and categorize tasks. The API provides user authentication and authorization using JWT. Audit logs to track changes for each task that act as a task history and the ability to archive completed tasks to keep the active task list uncluttered and to retrieve them when needed.

## Table of Contents

- [Installation Instructions](#installation-instructions)
- [Environment Setup Instructions](#environment-setup-instructions)
- [API Documentation](#api-documentation)

## Installation Instructions

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Adhamkhaled12/Task-Management.git
   ```

2. **Navigate to the project directory:**

   ```bash
   cd yourproject
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

## Environment Setup Instructions

1. **Create a .env file in the root of your project:**

2. **Add the following environment variables to your .env file:**

   ```bash
   NODE_ENV=development           # Set to 'production' when deploying
   PORT=5000                      # The port your server will run on (can be changed)
   MONGO_URI=mongodb://localhost:27017/yourdatabase  # MongoDB connection string
   JWT_SECRET=your_jwt_secret     # Secret key for signing JWT tokens
   JWT_EXPIRES_IN=1h              # Token expiration time
   EMAIL=your-email@gmail.com      # Your email address for sending emails
   EMAIL_PASS=your-email-password   # Your email password or app password
   ```

   - `Replace the placeholder values as follows:`
     - yourdatabase: Replace this with the name of your MongoDB database.
     - your_jwt_secret: Replace this with a strong secret key for signing JWT tokens.
     - your-email@gmail.com: Replace this with your Gmail address.
     - your-email-password: Replace this with your Gmail password or the app password you generated.

3. **Ensure that you have installed the necessary packages:**

   ```bash
   npm install dotenv mongoose jsonwebtoken bcryptjs nodemailer express async-handler ioredis helmet cors
   ```

4. **Set up your MongoDB:**
   - `Make sure you have MongoDB installed and running on your machine or use a cloud provider like MongoDB Atlas.`
   - `Update the MONGO_URI variable in the .env file accordingly.`
5. **Configure your Gmail account for sending emails:**
   - `If you are using Gmail, follow these steps to enable sending emails:`
     - Go to your Google Account settings.
     - Navigate to the Security section.
     - Enable "Less secure app access" or create an app password if you have two-factor authentication enabled.
6. **Set up Redis:**

- **Make sure you have Redis installed and running on your machine. You can install it using the following methods based on your operating system:**

  - **For Windows:**
    - **Download the Redis installer from [Microsoft's GitHub repository](https://github.com/microsoftarchive/redis/releases).**
    - **Run the installer and follow the setup instructions.**
  - **For macOS:**
    - **Use Homebrew to install Redis:**
      ```bash
      brew install redis
      ```
  - **For Linux:**

    - **Install Redis using your package manager. For example, on Ubuntu:**
      ```bash
      sudo apt update
      sudo apt install redis-server
      ```

  - **Start the Redis server by running the following command:**
    - **For Windows:**
      ```bash
      redis-server
      ```
    - **For macOS and Linux:**
      ```bash
      redis-server
      ```
  - **You should see logs indicating that the Redis server is running.**

  - **To test the Redis connection, open a new terminal window and type:**
    ```bash
    redis-cli
    ```
    **Then, run a simple command to check if it's working:**
    ```bash
    ping
    ```
    **If everything is set up correctly, it should return:**
    ```
    PONG
    ```

## Note

Make sure to never share your .env file or commit it to version control. Add it to your .gitignore file to prevent this:

```bash
# .gitignore
.env
```

## API Documentation

### User Routes

- **Route:** `POST /api/users/register`

  - **Description:** Register a new user. An email will be sent with an OTP code to verify the email address . You will be able to login after verifying your email.
  - **Request Body:**
    ```json
    {
      "name": "string",
      "email": "string",
      "password": "string",
      "role": "string" // Optional
    }
    ```
  - **Response:**
    - **Success (201):**
      ```json
      {
        "message": "User registered. Check your email to verify."
      }
      ```
    - **Error (400):**
      ```json
      {
        "message": "User already Exist!"
      }
      ```

- **Route:** `POST /api/users/verify-otp`

  - **Description:** Verify the email address by using the OTP code.
  - **Request Body:**
    ```json
    {
      "userId": "string",
      "otp": "string"
    }
    ```
  - **Response:**
    - **Success (200):**
      ```json
      {
        "message": "Account verified successfully."
      }
      ```
    - **Error (400):**
      ```json
      {
        "message": "OTP has expired."
      }
      ```
      ```json
      {
        "message": "Invalid OTP."
      }
      ```
    - **Error (404):**
      ```json
      {
        "message": "User not found."
      }
      ```

- **Route:** `POST /api/users/login`

  - **Description:** Authenticate a user after they have verified their email.
  - **Request Body:**
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```
  - **Response:**
    - **Success (200):**
      ```json
      {
        "_id": "string",
        "name": "string",
        "email": "string",
        "role": "string",
        "token": "string" // JWT token
      }
      ```
    - **Error (401):**
      ```json
      {
        "message": "Invalid credentials."
      }
      ```
    - **Error (403):**
      ```json
      {
        "message": "Verify your email before logging in."
      }
      ```

- **Route:** `POST /api/users/forgot-password`

  - **Description:** Request a password reset by sending a reset token to the user's email.
  - **Request Body:**
    ```json
    {
      "email": "string"
    }
    ```
  - **Response:**
    - **Success (200):**
      ```json
      {
        "message": "Password reset token sent to your email."
      }
      ```
    - **Error (404):**
      ```json
      {
        "message": "User not found."
      }
      ```

- **Route:** `POST /api/users/reset-password`

  - **Description:** Reset the user's password using the reset token.
  - **Query Parameters:**
    - `token`: The reset token sent to the user's email.
  - **Request Body:**
    ```json
    {
      "newPassword": "string"
    }
    ```
  - **Response:**
    - **Success (200):**
      ```json
      {
        "message": "Password has been reset successfully."
      }
      ```
    - **Error (400):**
      ```json
      {
        "message": "Invalid or expired token."
      }
      ```
    - **Error (404):**
      ```json
      {
        "message": "User not found."
      }
      ```

- **Route:** `GET /api/users`

  - **Description:** Retrieve a list of all users. This route is accessible only to users with the admin role.
  - **Access:** Private (requires admin role)
  - **Request Headers:**
    - `Authorization`: `Bearer <token>` // JWT token for authentication
  - **Response:**
    - **Success (200):**
      ```json
      [
        {
          "_id": "string",
          "name": "string",
          "email": "string",
          "role": "string"
        }
        // More users...
      ]
      ```
    - **Error (401):**
      ```json
      {
        "message": "Unauthorized. Admin role required."
      }
      ```

- **Route:** `DELETE /api/users/:id`

  - **Description:** Delete a user by their ID, it will also delete all tasks related to this user. This route is accessible only to users with the admin role.
  - **Access:** Private (requires admin role)
  - **Request Headers:**
    - `Authorization`: `Bearer <token>` // JWT token for authentication
  - **Path Parameters:**
    - `id`: The ID of the user to be deleted.
  - **Response:**
    - **Success (200):**
      ```json
      {
        "message": "User deleted successfully."
      }
      ```
    - **Error (400):**
      ```json
      {
        "message": "Invalid User ID."
      }
      ```
    - **Error (401):**
      ```json
      {
        "message": "Unauthorized. Admin role required."
      }
      ```
    - **Error (404):**
      ```json
      {
        "message": "User not found."
      }
      ```

### Task Routes

- **Route:** `POST /api/tasks`

  - **Description:** Create a new task.
  - **Access:** Private (requires JWT)
  - **Request Headers:**
    - `Authorization`: `Bearer <token>` // JWT token for authentication
  - **Request Body:**
    ```json
    {
      "title": "string",
      "description": "string",
      "status": "string",
      "priority": "string",
      "category": "string",
      "dueDate": "YYYY-MM-DD" // Optional
    }
    ```
  - **Response:**
    - **Success (201):**
      ```json
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "status": "string",
        "priority": "string",
        "category": "string",
        "dueDate": "YYYY-MM-DD",
        "archived": "boolean"
      }
      ```
    - **Error (401):**
      ```json
      {
        "message": "Unauthorized. Please provide a valid token."
      }
      ```

- **Route:** `GET /api/tasks`

  - **Description:** Retrieve a list of active tasks. You can filter tasks by `status`, `priority`, and `category`, and sort them using `sortBy`, with pagination.
  - **Access:** Private (requires JWT)
  - **Request Headers:**
    - `Authorization`: `Bearer <token>` // JWT token for authentication
  - **Query Parameters:**
    - `status`: Filter by task status (e.g., Pending, Completed).
    - `priority`: Filter by task priority (e.g., High, Medium, Low).
    - `category`: Filter by task category.
    - `sortBy`: Sort tasks by a field (e.g., dueDate).
    - `page`: Specify the page number for pagination (default is 1).
    - `limit`: Specify the number of tasks per page (default is 10).
  - **Response:**
    - **Success (200):**
      ```json
      [
        {
          "_id": "string",
          "title": "string",
          "description": "string",
          "status": "string",
          "priority": "string",
          "category": "string",
          "dueDate": "YYYY-MM-DD"
          "user": "string",
          "archived": "boolean",
          "createdAt": "YYYY-MM-DDTHH:MM:SS.sssZ",
          "updatedAt": "YYYY-MM-DDTHH:MM:SS.sssZ"
        }
        // More tasks...
      ]
      ```
    - **Error (401):**
      ```json
      {
        "message": "Unauthorized. Please provide a valid token."
      }
      ```

- **Route:** `PATCH /api/tasks/:id`

  - **Description:** Update a task by its ID.
  - **Access:** Private (requires JWT)
  - **Request Headers:**
    - `Authorization`: `Bearer <token>` // JWT token for authentication
  - **Path Parameters:**
    - `id`: The ID of the task to be updated.
  - **Request Body:**
    ```json
    {
      "title": "string", // Optional
      "description": "string", // Optional
      "status": "string", // Optional
      "priority": "string", // Optional
      "category": "string", // Optional
      "dueDate": "YYYY-MM-DD" // Optional
    }
    ```
  - **Response:**
    - **Success (200):**
      ```json
      {
        "_id": "string",
        "title": "string",
        "description": "string",
        "status": "string",
        "priority": "string",
        "category": "string",
        "dueDate": "YYYY-MM-DD",
        "user": "string",
        "archived": "boolean",
        "createdAt": "YYYY-MM-DDTHH:MM:SS.sssZ",
        "updatedAt": "YYYY-MM-DDTHH:MM:SS.sssZ"
      }
      ```
    - **Error (401):**
      ```json
      {
        "message": "Unauthorized. Please provide a valid token."
      }
      ```
    - **Error (404):**
      ```json
      {
        "message": "Task not found."
      }
      ```

- **Route:** `DELETE /api/tasks/:id`
  - **Description:** Delete a task by its ID.
  - **Access:** Private (requires JWT)
  - **Request Headers:**
    - `Authorization`: `Bearer <token>` // JWT token for authentication
  - **Path Parameters:**
    - `id`: The ID of the task to be deleted.
  - **Response:**
    - **Success (200):**
      ```json
      {
        "message": "Task deleted successfully."
      }
      ```
    - **Error (401):**
      ```json
      {
        "message": "Unauthorized. Please provide a valid token."
      }
      ```
    - **Error (404):**
      ```json
      {
        "message": "Task not found."
      }
      ```
- **Route:** `GET /api/tasks/:id/history`

  - **Description:** Retrieve the history of changes made to a specific task, including who modified it and when.
  - **Access:** Private (requires JWT)
  - **Request Headers:**
    - `Authorization`: `Bearer <token>` // JWT token for authentication
  - **Path Parameters:**
    - `id`: The ID of the task for which the history is retrieved.
  - **Response:**
  - **Success (200):**

  ```json
  [
    {
      "taskId": "string",
      "modifiedBy": {
        "name": "string",
        "email": "string"
      },
      "changeType": "string",
      "updates": [
        {
          "field": "string",
          "oldValue": "string",
          "newValue": "string"
        }
      ],
      "timestamp": "YYYY-MM-DDTHH:MM:SS.sssZ"
    }
    // More history entries...
  ]
  ```

  - **Error (404):**
    ```json
    {
      "message": "No history found for this task."
    }
    ```

- **Route:** `PATCH /api/tasks/:id/archive`

  - **Description:** Archive a task by ID, marking it as done and preventing it from appearing in the active task list.
  - **Access:** Private (requires JWT)
  - **Request Headers:**
    - `Authorization`: `Bearer <token>` // JWT token for authentication
  - **Path Parameters:**
    - `id`: The ID of the task to be archived.
  - **Response:**
  - **Success (200):**

  ```json
  {
    "message": "Task archived successfully.",
    "task": {
      "_id": "string",
      "title": "string",
      "description": "string",
      "status": "Done",
      "priority": "string",
      "category": "string",
      "dueDate": "YYYY-MM-DD",
      "user": "string",
      "archived": true,
      "createdAt": "YYYY-MM-DDTHH:MM:SS.sssZ",
      "updatedAt": "YYYY-MM-DDTHH:MM:SS.sssZ"
    }
  }
  ```

  - **Error (404):**
    ```json
    {
      "message": "Task not found or already archived."
    }
    ```
  - **Error (500):**
    ```json
    {
      "message": "Failed to archive task. <error message>."
    }
    ```

- **Route:** `GET /api/tasks/archived?page=1&limit=10`

  - **Description:** Retrieve a list of archived tasks for the authenticated user with pagination.
  - **Access:** Private (requires JWT)
  - **Request Headers:**
    - `Authorization`: `Bearer <token>` // JWT token for authentication
  - **Query Parameters:**
    - `page`: Specify the page number for pagination (default is 1).
    - `limit`: Specify the number of tasks per page (default is 10).
  - **Response:**
  - **Success (200):**

  ```json
  [
    {
      "_id": "string",
      "title": "string",
      "description": "string",
      "status": "Done",
      "priority": "string",
      "category": "string",
      "dueDate": "YYYY-MM-DD",
      "user": "string",
      "archived": true,
      "createdAt": "YYYY-MM-DDTHH:MM:SS.sssZ",
      "updatedAt": "YYYY-MM-DDTHH:MM:SS.sssZ"
    }
    // More archived tasks...
  ]
  ```

- **Route:** `PATCH /api/tasks/:id/restore`
  - **Description:** Restore an archived task by ID, marking it as active and setting its status to "Pending.".
  - **Access:** Private (requires JWT)
  - **Request Headers:**
    - `Authorization`: `Bearer <token>` // JWT token for authentication
  - **Path Parameters:**
    - `id`: The ID of the task to be restored.
  - **Response:**
  - **Success (200):**
  ```json
  {
    "message": "Task restored successfully.",
    "task": {
      "_id": "string",
      "title": "string",
      "description": "string",
      "status": "Pending",
      "priority": "string",
      "category": "string",
      "dueDate": "YYYY-MM-DD",
      "user": "string",
      "archived": false,
      "createdAt": "YYYY-MM-DDTHH:MM:SS.sssZ",
      "updatedAt": "YYYY-MM-DDTHH:MM:SS.sssZ"
    }
  }
  ```
  - **Error (404):**
    ```json
    {
      "message": "Archived task not found."
    }
    ```
  - **Error (500):**
    ```json
    {
      "message": "Failed to restore task. <error message>."
    }
    ```

## License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).

# Task Tracker CLI By Ahmed Hesham

Task Tracker CLI is a simple command-line application for managing tasks. It allows you to add, update, delete, and view tasks stored in a JSON file. The application ensures data integrity and provides robust error handling.

## Features

- Add tasks with descriptions.
- Update task statuses (e.g., `todo`, `in-progress`, `done`).
- Delete tasks by ID.
- List all tasks with details.
- Automatically generates unique task IDs.
- Validates and sanitizes task descriptions.
- Handles corrupted or invalid task data gracefully.
- Ensures secure file operations.

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd taskTracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

Run the CLI application using Node.js:

```bash
node index.js <command> [arguments]
```

### Available Commands

- **Add a task:**
  ```bash
  node index.js add "Task description"
  ```

- **Update a task's status:**
  ```bash
  node index.js update <task-id> <status>
  ```
  Valid statuses: `todo`, `in-progress`, `done`.

- **Delete a task:**
  ```bash
  node index.js delete <task-id>
  ```

- **List all tasks:**
  ```bash
  node index.js list
  ```
  Displays all tasks with their IDs, statuses, descriptions, creation dates, and update dates.

### Demo Data Generation

You can quickly create 10 dummy tasks for testing purposes using the included script:

```bash
node taskManager.js
```

This will create a set of 10 tasks with various descriptions and statuses (todo, in-progress, and done) and then list them all.

## Testing

Run the test suite using Mocha:

```bash
npm test
```

The tests are located in the `test/index.test.js` file and cover the following areas:

- File storage and data persistence.
- Task operations (e.g., adding, deleting, updating tasks).
- Data integrity and validation.
- Task status management.
- Task listing functionality.

## Project Structure

```
index.js          # Main application logic
package.json      # Project metadata and dependencies
README.md         # This documentation file
taskManager.js    # Script for generating demo tasks
test/             # Test suite
  index.test.js   # Unit tests for the application
```

## Security

- Task descriptions are sanitized to remove potentially harmful content (e.g., HTML tags).
- File operations are restricted to the project directory to prevent unauthorized access.
- Task data is validated to ensure consistency and integrity.


## Project URLs
- https://roadmap.sh/projects/task-tracker
- https://github.com/AhmedHeshamC/taskTracker

## 🤝 Contributing

1. Fork the repo
2. Create feature branch
3. Write tests
4. Submit a PR

Please adhere to the existing code style and coverage requirements.

---

© 2025 Ahmed Hesham. MIT License.

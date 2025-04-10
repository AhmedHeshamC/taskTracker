# Task Tracker CLI By Ahmed Hesham

Task Tracker CLI is a simple command-line application for managing tasks. It allows you to add, update, delete, and view tasks stored in a JSON file. The application ensures data integrity and provides robust error handling.

## Features

- Add tasks with descriptions.
- Update task statuses (e.g., `todo`, `in-progress`, `done`).
- Delete tasks by ID.
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

- **View tasks:**
  Open the `tasks.json` file in the project directory to view all tasks.

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

## Project Structure

```
index.js          # Main application logic
package.json      # Project metadata and dependencies
test/             # Test suite
  index.test.js   # Unit tests for the application
```

## Security

- Task descriptions are sanitized to remove potentially harmful content (e.g., HTML tags).
- File operations are restricted to the project directory to prevent unauthorized access.
- Task data is validated to ensure consistency and integrity.

## License

This project is licensed under the ISC License.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_FILE = path.join(process.cwd(), 'tasks.json');
const TEMP_FILE = path.join(process.cwd(), '.tasks.tmp.json');
const MAX_DESCRIPTION_LENGTH = 1000;

// Security utility functions
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags completely
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .trim();
};

const validateFilePath = (filePath) => {
  const resolvedPath = path.resolve(filePath);
  const workingDir = process.cwd();
  if (!resolvedPath.startsWith(workingDir)) {
    throw new Error('Invalid file path: Access denied');
  }
  return resolvedPath;
};

const validateTask = (task) => {
  if (typeof task.id !== 'number' || task.id <= 0 || !Number.isInteger(task.id)) {
    throw new Error('Invalid task ID');
  }
  if (typeof task.description !== 'string' || task.description.trim().length === 0) {
    throw new Error('Invalid task description');
  }
  if (!['todo', 'in-progress', 'done'].includes(task.status)) {
    throw new Error('Invalid task status');
  }
  if (isNaN(Date.parse(task.createdAt)) || isNaN(Date.parse(task.updatedAt))) {
    throw new Error('Invalid task timestamps');
  }
};

// File system utilities
const readTasks = () => {
  try {
    validateFilePath(DATA_FILE);
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    let tasks;
    try {
      tasks = JSON.parse(data);
    } catch (parseError) {
      throw new Error('Failed to parse tasks JSON');
    }

    // Validate task data
    const ids = new Set();
    tasks.forEach(task => {
      validateTask(task); // Validate each task
      if (ids.has(task.id)) {
        throw new Error('Duplicate task ID found');
      }
      ids.add(task.id);
    });

    return tasks;
  } catch (error) {
    if (error.code === 'ENOENT') {
      fs.writeFileSync(DATA_FILE, '[]', { mode: 0o600 }); // Secure file creation
      return [];
    }
    throw error;
  }
};

const writeTasks = (tasks) => {
  if (!Array.isArray(tasks)) {
    throw new Error('Invalid tasks data');
  }

  tasks.forEach(validateTask); // Validate all tasks before writing

  validateFilePath(DATA_FILE);
  validateFilePath(TEMP_FILE);

  // Write to temporary file first
  const tempContent = JSON.stringify(tasks, null, 2);
  fs.writeFileSync(TEMP_FILE, tempContent, { mode: 0o600 });

  // Verify the written content
  const readBack = fs.readFileSync(TEMP_FILE, 'utf8');
  if (readBack !== tempContent) {
    throw new Error('Data verification failed');
  }

  // Atomically rename temp file to target file
  fs.renameSync(TEMP_FILE, DATA_FILE);

  // Set secure permissions
  fs.chmodSync(DATA_FILE, 0o600);
};

// Task management functions
const generateSecureId = (tasks) => {
  // Generate the next sequential ID based on existing tasks
  const maxId = tasks.reduce((max, task) => Math.max(max, task.id), 0);
  return maxId + 1;
};

const addTask = (description) => {
  if (!description || typeof description !== 'string') {
    throw new Error('Task description is required');
  }

  const sanitizedDescription = sanitizeInput(description);
  if (sanitizedDescription.length === 0) {
    throw new Error('Task description cannot be empty');
  }
  if (sanitizedDescription.length > MAX_DESCRIPTION_LENGTH) {
    throw new Error(`Task description too long (max ${MAX_DESCRIPTION_LENGTH} characters)`);
  }

  const tasks = readTasks();
  const newId = generateSecureId(tasks); // Use sequential ID generation

  const newTask = {
    id: newId,
    description: sanitizedDescription,
    status: 'todo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  tasks.push(newTask);
  writeTasks(tasks);
  console.log(`Task added successfully (ID: ${newTask.id})`);
};

const updateTaskStatus = (id, newStatus) => {
  if (!id || isNaN(parseInt(id))) {
    throw new Error('Valid task ID is required');
  }

  const validStatuses = ['todo', 'in-progress', 'done'];
  if (!validStatuses.includes(newStatus)) {
    throw new Error('Invalid status. Must be: todo, in-progress, or done');
  }

  const tasks = readTasks();
  const task = tasks.find(t => t.id === parseInt(id));
  if (!task) {
    throw new Error('Task not found');
  }

  task.status = newStatus;
  task.updatedAt = new Date().toISOString();
  writeTasks(tasks);
  console.log(`Task ${id} status updated to: ${newStatus}`);
};

const deleteTask = (id) => {
  if (!id || isNaN(parseInt(id))) {
    throw new Error('Valid task ID is required');
  }

  const tasks = readTasks();
  const taskIndex = tasks.findIndex(t => t.id === parseInt(id));
  if (taskIndex === -1) {
    throw new Error('Task not found');
  }

  tasks.splice(taskIndex, 1); // Remove the task by index
  writeTasks(tasks);
  console.log(`Task ${id} deleted successfully`);
};

// CLI command handling
const main = () => {
  try {
    const [command, ...args] = process.argv.slice(2);

    switch (command) {
      case 'add':
        addTask(args[0]);
        break;
      case 'update':
        updateTaskStatus(args[0], args[1]);
        break;
      case 'delete':
        deleteTask(args[0]);
        break;
      default:
        console.log('Available commands: add <description>, update <id> <status>, delete <id>');
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

main();

export { readTasks, addTask, updateTaskStatus, deleteTask };
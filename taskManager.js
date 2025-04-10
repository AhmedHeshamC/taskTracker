import { addTask, updateTaskStatus, listTasks } from './index.js';
import fs from 'fs';
import path from 'path';

// Function to create dummy tasks for testing
const createDummyTasks = () => {
  console.log('Creating 10 dummy tasks...');
  
  // Create tasks with variety of descriptions and statuses
  const tasks = [
    { description: "Complete the project documentation", status: "todo" },
    { description: "Fix authentication bug in login module", status: "in-progress" },
    { description: "Set up CI/CD pipeline for automated testing", status: "done" },
    { description: "Design database schema for user profiles", status: "todo" },
    { description: "Implement responsive design for mobile view", status: "in-progress" },
    { description: "Conduct code review for pull request #42", status: "done" },
    { description: "Optimize query performance for search functionality", status: "todo" },
    { description: "Create user onboarding tutorial", status: "in-progress" },
    { description: "Update dependencies to latest versions", status: "done" },
    { description: "Add error logging and monitoring", status: "todo" }
  ];
  
  // Add each task and update its status
  tasks.forEach(task => {
    addTask(task.description);
    if (task.status !== 'todo') {
      // Get the ID of the task just added
      const taskId = getLastAddedTaskId();
      updateTaskStatus(taskId, task.status);
    }
  });
  
  console.log('Dummy tasks created successfully!');
};

// Helper function to get the last added task ID
// This is a simple hack for this script - in a real app we'd have proper task management
const getLastAddedTaskId = () => {
  try {
    const DATA_FILE = path.join(process.cwd(), 'tasks.json');
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const tasks = JSON.parse(data);
    if (tasks.length > 0) {
      return tasks[tasks.length - 1].id;
    }
    return 1;
  } catch (error) {
    console.error('Error getting last task ID:', error.message);
    return 1;
  }
};

// Execute if this file is run directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  createDummyTasks();
  // List all tasks after creation
  console.log('\nListing all tasks:');
  listTasks();
}

export { createDummyTasks };
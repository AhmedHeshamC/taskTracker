import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { readTasks, addTask, deleteTask, updateTaskStatus } from '../index.js';

const DATA_FILE = path.join(process.cwd(), 'tasks.json');

describe('Task Manager Core Functionality', () => {
  beforeEach(() => {
    if (fs.existsSync(DATA_FILE)) {
      fs.unlinkSync(DATA_FILE);
    }
  });

  afterEach(() => {
    if (fs.existsSync(DATA_FILE)) {
      fs.unlinkSync(DATA_FILE);
    }
  });

  describe('File Storage', () => {
    it('should create tasks.json on first read', () => {
      const tasks = readTasks();
      expect(fs.existsSync(DATA_FILE)).to.be.true;
      expect(tasks).to.be.an('array').that.is.empty;
    });

    it('should handle file system errors gracefully', () => {
      const testError = () => {
        const originalPermissions = fs.statSync(process.cwd()).mode;
        try {
          fs.chmodSync(process.cwd(), 0o444); // Make directory read-only
          readTasks();
        } catch (error) {
          throw error;
        } finally {
          fs.chmodSync(process.cwd(), originalPermissions); // Restore permissions
        }
      };
      expect(testError).to.throw();
    });

    it('should maintain data persistence', () => {
      addTask('Persistent task');
      const tasks1 = readTasks();
      const tasks2 = readTasks();
      expect(tasks1).to.deep.equal(tasks2);
    });
  });

  describe('Task Operations', () => {
    it('should auto-increment task IDs correctly', () => {
      addTask('First task');
      addTask('Second task');
      const tasks = readTasks();
      expect(tasks[0].id).to.equal(1); // IDs should start from 1
      expect(tasks[1].id).to.equal(2); // IDs should increment sequentially
      expect(tasks).to.have.lengthOf(2);
    });

    it('should maintain unique IDs after deletions', () => {
      addTask('Task A');
      addTask('Task B');
      deleteTask(1); // Delete the first task
      addTask('New task after deletion');
      const tasks = readTasks();
      expect(tasks.map(t => t.id)).to.deep.equal([2, 3]); // IDs should remain unique
    });

    it('should reject excessively long task descriptions', () => {
      const longDescription = 'a'.repeat(1001);
      expect(() => addTask(longDescription)).to.throw();
    });

    it('should handle empty task descriptions', () => {
      expect(() => addTask('')).to.throw();
      expect(() => addTask()).to.throw();
    });

    it('should trim task descriptions', () => {
      addTask('  Task with spaces  ');
      const [task] = readTasks();
      expect(task.description).to.equal('Task with spaces');
    });

    it('should handle adding a large number of tasks', () => {
      for (let i = 0; i < 1000; i++) {
        addTask(`Task ${i + 1}`);
      }
      const tasks = readTasks();
      expect(tasks).to.have.lengthOf(1000);
      expect(tasks[999].description).to.equal('Task 1000');
    });

    it('should handle special characters in task descriptions', () => {
      const specialDescription = '<script>alert("XSS")</script>';
      addTask(specialDescription);
      const [task] = readTasks();
      expect(task.description).to.equal('alert("XSS")'); // Sanitized description
    });
  });

  describe('Data Integrity', () => {
    it('should maintain required task properties', () => {
      addTask('Test task');
      const [task] = readTasks();
      expect(task).to.have.all.keys(
        'id',
        'description',
        'status',
        'createdAt',
        'updatedAt'
      );
      expect(new Date(task.createdAt)).to.be.a('date');
      expect(new Date(task.updatedAt)).to.be.a('date');
    });

    it('should validate task status values', () => {
      addTask('Status test task');
      let tasks = readTasks();
      expect(tasks[0].status).to.equal('todo');

      tasks[0].status = 'invalid_status';
      expect(() => {
        fs.writeFileSync(DATA_FILE, JSON.stringify(tasks));
        readTasks();
      }).to.throw();
    });

    it('should prevent duplicate task IDs', () => {
      addTask('Task 1');
      let tasks = readTasks();
      const duplicateTask = { ...tasks[0], description: 'Duplicate ID task' };
      tasks.push(duplicateTask);
      expect(() => {
        fs.writeFileSync(DATA_FILE, JSON.stringify(tasks));
        readTasks();
      }).to.throw();
    });

    it('should handle corrupted task data gracefully', () => {
      fs.writeFileSync(DATA_FILE, '[{ "id": "invalid", "description": 123 }]');
      expect(() => readTasks()).to.throw('Invalid task ID');
    });
  });

  describe('Task Status Management', () => {
    it('should initialize new tasks with todo status', () => {
      addTask('New task');
      const [task] = readTasks();
      expect(task.status).to.equal('todo');
    });

    it('should validate status transitions', () => {
      addTask('Status transition task');
      const validStatuses = ['todo', 'in-progress', 'done'];
      validStatuses.forEach(status => {
        updateTaskStatus(1, status); // Update the status of the first task
        const [task] = readTasks();
        expect(task.status).to.equal(status);
      });
    });

    it('should reject invalid status transitions', () => {
      addTask('Invalid status transition task');
      expect(() => updateTaskStatus(1, 'invalid_status')).to.throw();
    });

    it('should handle rapid status updates', () => {
      addTask('Rapid status update task');
      for (let i = 0; i < 10; i++) {
        updateTaskStatus(1, i % 2 === 0 ? 'in-progress' : 'done');
      }
      const [task] = readTasks();
      expect(task.status).to.be.oneOf(['in-progress', 'done']);
    });
  });
});
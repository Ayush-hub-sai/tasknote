import { Injectable, signal } from '@angular/core';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'todo' | 'in-progress' | 'done' | 'archived';
  dueDate?: Date;
  tags: string[];
  subtasks: Subtask[];
  createdAt: Date;
  updatedAt: Date;
  attachments?: Attachment[];
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  type: 'audio' | 'video' | 'image';
  url: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks = signal<Task[]>([]);
  private nextId = 1;

  getTasks() {
    return this.tasks;
  }

  getTaskById(id: string) {
    return this.tasks().find(task => task.id === id);
  }

  createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    const task: Task = {
      ...taskData,
      id: this.nextId.toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.tasks.update(tasks => [...tasks, task]);
    this.nextId++;
    return task;
  }

  updateTask(id: string, updates: Partial<Task>) {
    this.tasks.update(tasks =>
      tasks.map(task =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      )
    );
  }

  deleteTask(id: string) {
    this.tasks.update(tasks => tasks.filter(task => task.id !== id));
  }

  archiveTask(id: string) {
    this.updateTask(id, { status: 'archived' });
  }

  getTasksByStatus(status: Task['status']) {
    return this.tasks().filter(task => task.status === status);
  }

  getOverdueTasks() {
    const now = new Date();
    return this.tasks().filter(task =>
      task.dueDate && task.dueDate < now && task.status !== 'done' && task.status !== 'archived'
    );
  }

  searchTasks(query: string) {
    const lowerQuery = query.toLowerCase();
    return this.tasks().filter(task =>
      task.title.toLowerCase().includes(lowerQuery) ||
      task.description?.toLowerCase().includes(lowerQuery) ||
      task.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }
}
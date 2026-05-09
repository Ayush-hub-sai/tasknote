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
  private tasks = signal<Task[]>(this.createSeedTasks());
  private nextId = 7;

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

  reorderTasks(previousIndex: number, currentIndex: number) {
    this.tasks.update(tasks => {
      const next = [...tasks];
      const [moved] = next.splice(previousIndex, 1);
      next.splice(currentIndex, 0, moved);
      return next;
    });
  }

  private createSeedTasks(): Task[] {
    const now = new Date();
    const dueToday = new Date(now);
    dueToday.setHours(17, 0, 0, 0);
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(11, 30, 0, 0);
    const overdue = new Date(now);
    overdue.setDate(now.getDate() - 1);
    overdue.setHours(15, 0, 0, 0);

    return [
      {
        id: '1',
        title: 'Design launch command center',
        description: 'Finalize the glass dashboard, navigation rhythm, and first-run onboarding checklist.',
        priority: 'critical',
        status: 'in-progress',
        dueDate: dueToday,
        tags: ['launch', 'design'],
        subtasks: [
          { id: '1-1', title: 'Hero layout', completed: true },
          { id: '1-2', title: 'Mobile review', completed: true },
          { id: '1-3', title: 'Accessibility pass', completed: false }
        ],
        createdAt: new Date(now.getTime() - 86400000),
        updatedAt: now,
        attachments: []
      },
      {
        id: '2',
        title: 'Record voice note workflow',
        description: 'Capture waveform behavior, transcription fallback, playback controls, and attachment flow.',
        priority: 'high',
        status: 'todo',
        dueDate: tomorrow,
        tags: ['audio', 'media'],
        subtasks: [
          { id: '2-1', title: 'Recorder UI', completed: true },
          { id: '2-2', title: 'Waveform canvas', completed: false },
          { id: '2-3', title: 'Playback speed menu', completed: false }
        ],
        createdAt: new Date(now.getTime() - 172800000),
        updatedAt: now,
        attachments: [{ id: 'a1', type: 'audio', url: '', name: 'intro-idea.webm' }]
      },
      {
        id: '3',
        title: 'Prepare OCR scan demo',
        description: 'Use camera capture to extract text into the command bar.',
        priority: 'medium',
        status: 'todo',
        dueDate: overdue,
        tags: ['ocr', 'search'],
        subtasks: [
          { id: '3-1', title: 'Camera permission state', completed: true },
          { id: '3-2', title: 'Tesseract worker status', completed: false }
        ],
        createdAt: new Date(now.getTime() - 259200000),
        updatedAt: now,
        attachments: []
      },
      {
        id: '4',
        title: 'Publish keyboard shortcuts panel',
        description: 'Add ? shortcut overlay and command hints for power users.',
        priority: 'medium',
        status: 'done',
        dueDate: dueToday,
        tags: ['ux', 'keyboard'],
        subtasks: [
          { id: '4-1', title: 'Shortcut model', completed: true },
          { id: '4-2', title: 'Overlay copy', completed: true }
        ],
        createdAt: new Date(now.getTime() - 345600000),
        updatedAt: now,
        attachments: []
      },
      {
        id: '5',
        title: 'Connect Claude agent endpoint',
        description: 'Move API key server-side and stream assistant responses into the sidebar.',
        priority: 'high',
        status: 'in-progress',
        dueDate: tomorrow,
        tags: ['ai', 'agent'],
        subtasks: [
          { id: '5-1', title: 'Context builder', completed: true },
          { id: '5-2', title: 'Streaming UI', completed: false },
          { id: '5-3', title: 'Tool actions', completed: false }
        ],
        createdAt: new Date(now.getTime() - 432000000),
        updatedAt: now,
        attachments: []
      },
      {
        id: '6',
        title: 'Archive old meeting notes',
        description: 'Move stale notes into the research notebook.',
        priority: 'low',
        status: 'archived',
        tags: ['notes'],
        subtasks: [{ id: '6-1', title: 'Archive notes', completed: true }],
        createdAt: new Date(now.getTime() - 604800000),
        updatedAt: now,
        attachments: []
      }
    ];
  }
}

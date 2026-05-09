export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: Date;
  tags: string[];
  subtasks: Subtask[];
  createdAt: Date;
  updatedAt: Date;
  attachments?: Attachment[];
}

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'archived';

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

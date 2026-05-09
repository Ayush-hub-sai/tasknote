import { Note } from './note.model';
import { Task } from './task.model';

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AgentContext {
  tasks: Task[];
  notes: Note[];
  currentDate: Date;
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AgentContext } from '../../models/agent.model';
import { NoteService } from '../note/note.service';
import { Task } from '../../models/task.model';
import { TaskService } from '../task/task.service';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private apiUrl = 'https://api.anthropic.com/v1/messages'; // Claude API endpoint
  private apiKey = 'YOUR_CLAUDE_API_KEY'; // Should be in environment

  constructor(
    private http: HttpClient,
    private taskService: TaskService,
    private noteService: NoteService
  ) {}

  sendMessage(message: string): Observable<string> {
    const context = this.buildContext();
    const prompt = this.buildPrompt(message, context);

    // For demo purposes, return mock responses
    // In production, use actual Claude API
    return this.mockClaudeResponse(message);
  }

  private buildContext(): AgentContext {
    return {
      tasks: this.taskService.getTasks()(),
      notes: this.noteService.getNotes()(),
      currentDate: new Date()
    };
  }

  private buildPrompt(message: string, context: AgentContext): string {
    return `
You are an AI assistant for TaskNote, a task and note management application.

Current context:
- Tasks: ${context.tasks.length} total tasks
- Notes: ${context.notes.length} total notes
- Current date: ${context.currentDate.toISOString()}

User message: ${message}

Please provide helpful, contextual responses related to task and note management.
`;
  }

  private mockClaudeResponse(message: string): Observable<string> {
    // Mock responses for demo
    const responses = [
      "I've analyzed your tasks. You have 3 overdue items that need attention.",
      "Based on your notes, I can help you organize them into folders.",
      "I've created a summary of your day's tasks.",
      "Would you like me to prioritize your task list?",
      "I can help you draft a note from your voice recording."
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    return of(randomResponse);
  }

  // Quick actions
  summarizeDayTasks(): Observable<string> {
    const tasks = this.taskService.getTasks()();
    const todayTasks = tasks.filter((task: Task) => {
      const today = new Date();
      return task.createdAt.toDateString() === today.toDateString();
    });

    return of(`Today you have ${todayTasks.length} tasks: ${todayTasks.map((t: Task) => t.title).join(', ')}`);
  }

  findOverdueItems(): Observable<string> {
    const overdue = this.taskService.getOverdueTasks();
    return of(`You have ${overdue.length} overdue tasks: ${overdue.map(t => t.title).join(', ')}`);
  }

  prioritizeTaskList(): Observable<string> {
    const allTasks = this.taskService.getTasks()();
    const tasks = allTasks.filter((t: Task) => t.status !== 'done');
    const prioritized = tasks.sort((a: Task, b: Task) => {
      const priorityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    return of(`Prioritized tasks: ${prioritized.slice(0, 5).map((t: Task) => t.title).join(', ')}`);
  }
}

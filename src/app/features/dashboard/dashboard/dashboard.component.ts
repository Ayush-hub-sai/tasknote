import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { TaskService, Task } from '../../../core/services/task/task.service';
import { NoteService, Note } from '../../../core/services/note/note.service';
import { AgentService, AgentMessage } from '../../../core/services/agent/agent.service';
import { CommandBarComponent } from '../../search/command-bar/command-bar.component';
import { ThemeSwitcherComponent } from '../../settings/theme-switcher/theme-switcher.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSidenavModule,
    DragDropModule,
    CommandBarComponent,
    ThemeSwitcherComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  agentOpen = false;
  shortcutsOpen = false;
  onboardingOpen = typeof localStorage === 'undefined' ? false : !localStorage.getItem('tasknote-onboarded');
  activeView = signal<'kanban' | 'list' | 'calendar'>('kanban');
  markdownPreview = signal(true);
  selectedTask = signal<Task | null>(null);
  newMessage = '';
  newTaskTitle = '';
  newNoteTitle = '';
  recording = false;
  videoRecording = false;
  playbackSpeed = 1;
  messages = signal<AgentMessage[]>([]);
  readonly columns: Array<{ label: string; status: Task['status']; icon: string }> = [
    { label: 'To Do', status: 'todo', icon: 'radio_button_unchecked' },
    { label: 'In Progress', status: 'in-progress', icon: 'pending_actions' },
    { label: 'Done', status: 'done', icon: 'task_alt' }
  ];

  // Computed signals for stats
  totalTasks = computed(() => this.taskService.getTasks()().length);
  completedTasks = computed(() =>
    this.taskService.getTasks()().filter((t: Task) => t.status === 'done').length
  );
  overdueTasks = computed(() => this.taskService.getOverdueTasks().length);
  totalNotes = computed(() => this.noteService.getNotes()().length);

  recentTasks = computed(() =>
    this.taskService.getTasks()()
      .filter((t: Task) => t.status !== 'archived')
      .sort((a: Task, b: Task) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
  );

  pinnedNotes = computed(() => this.noteService.getPinnedNotes().slice(0, 5));
  activeTasks = computed(() => this.taskService.getTasks()().filter((t: Task) => t.status !== 'archived'));
  folders = computed(() => this.noteService.getFolders());

  constructor(
    private taskService: TaskService,
    private noteService: NoteService,
    private agentService: AgentService
  ) {}

  toggleAgent() {
    this.agentOpen = !this.agentOpen;
  }

  addTask() {
    const title = this.newTaskTitle.trim() || 'Untitled task';
    this.taskService.createTask({
      title,
      description: 'New task created from the dashboard quick capture.',
      priority: 'medium',
      status: 'todo',
      dueDate: new Date(Date.now() + 86400000),
      tags: ['quick-capture'],
      subtasks: [
        { id: `${Date.now()}-1`, title: 'Clarify outcome', completed: false },
        { id: `${Date.now()}-2`, title: 'Add context', completed: false }
      ],
      attachments: []
    });
    this.newTaskTitle = '';
  }

  addNote() {
    const title = this.newNoteTitle.trim() || 'Untitled note';
    this.noteService.createNote({
      title,
      content: 'Start writing with **Markdown**, embed media, or ask the agent to structure this note.',
      folder: 'Inbox',
      tags: ['quick-note'],
      isPinned: true,
      attachments: []
    });
    this.newNoteTitle = '';
  }

  editTask(task: Task) {
    this.selectedTask.set(task);
    this.taskService.updateTask(task.id, {
      title: `${task.title} (edited)`,
      updatedAt: new Date()
    });
  }

  deleteTask(task: Task) {
    this.taskService.deleteTask(task.id);
  }

  archiveTask(task: Task) {
    this.taskService.archiveTask(task.id);
  }

  moveTask(task: Task, status: Task['status']) {
    this.taskService.updateTask(task.id, { status });
  }

  dropTask(event: CdkDragDrop<Task[]>, status: Task['status']) {
    const task = event.item.data as Task;
    if (task.status !== status) {
      this.moveTask(task, status);
    } else {
      this.taskService.reorderTasks(event.previousIndex, event.currentIndex);
    }
  }

  progress(task: Task) {
    if (!task.subtasks.length) return 0;
    return Math.round((task.subtasks.filter(item => item.completed).length / task.subtasks.length) * 100);
  }

  countdown(task: Task) {
    if (!task.dueDate) return 'No due date';
    const diff = task.dueDate.getTime() - Date.now();
    if (diff < 0 && task.status !== 'done') return 'Overdue';
    if (task.status === 'done') return 'Complete';
    const hours = Math.max(1, Math.ceil(diff / 3600000));
    return hours < 24 ? `${hours}h left` : `${Math.ceil(hours / 24)}d left`;
  }

  toggleRecording() {
    this.recording = !this.recording;
  }

  toggleVideoRecording() {
    this.videoRecording = !this.videoRecording;
  }

  closeOnboarding() {
    this.onboardingOpen = false;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('tasknote-onboarded', 'true');
    }
  }

  quickAction(action: string) {
    let observable;
    switch (action) {
      case 'summarize':
        observable = this.agentService.summarizeDayTasks();
        break;
      case 'overdue':
        observable = this.agentService.findOverdueItems();
        break;
      case 'prioritize':
        observable = this.agentService.prioritizeTaskList();
        break;
      case 'voice':
        observable = this.agentService.sendMessage('Draft a structured note from the latest voice transcript.');
        break;
      case 'subtasks':
        observable = this.agentService.sendMessage(`Create subtasks for ${this.selectedTask()?.title || 'the selected task'}.`);
        break;
    }

    if (observable) {
      observable.subscribe(response => {
        this.messages.update(msgs => [...msgs, {
          id: Date.now().toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date()
        }]);
      });
    }
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: this.newMessage,
      timestamp: new Date()
    };

    this.messages.update(msgs => [...msgs, userMessage]);
    const message = this.newMessage;
    this.newMessage = '';

    this.agentService.sendMessage(message).subscribe(response => {
      const agentMessage: AgentMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      this.messages.update(msgs => [...msgs, agentMessage]);
    });
  }
}

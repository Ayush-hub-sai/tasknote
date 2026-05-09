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
import { TaskService, Task } from '../../../core/services/task/task.service';
import { NoteService, Note } from '../../../core/services/note/note.service';
import { AgentService, AgentMessage } from '../../../core/services/agent/agent.service';
import { CommandBarComponent } from '../../search/command-bar/command-bar.component';

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
    CommandBarComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  agentOpen = false;
  newMessage = '';
  messages = signal<AgentMessage[]>([]);

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

  constructor(
    private taskService: TaskService,
    private noteService: NoteService,
    private agentService: AgentService
  ) {}

  toggleAgent() {
    this.agentOpen = !this.agentOpen;
  }

  addTask() {
    // TODO: Open task creation modal
    console.log('Add task clicked');
  }

  addNote() {
    // TODO: Open note creation modal
    console.log('Add note clicked');
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
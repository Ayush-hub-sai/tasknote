import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { Task } from '../../../../core/models/task.model';
import { NoteService } from '../../../../core/services/note/note.service';
import { TaskService } from '../../../../core/services/task/task.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule
  ],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent {
  newTaskTitle = '';
  newNoteTitle = '';

  totalTasks = computed(() => this.taskService.getTasks()().length);
  completedTasks = computed(() => this.taskService.getTasks()().filter((task: Task) => task.status === 'done').length);
  overdueTasks = computed(() => this.taskService.getOverdueTasks().length);
  totalNotes = computed(() => this.noteService.getNotes()().length);
  recentTasks = computed(() =>
    this.taskService.getTasks()()
      .filter(task => task.status !== 'archived')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 4)
  );
  pinnedNotes = computed(() => this.noteService.getPinnedNotes().slice(0, 4));

  constructor(private taskService: TaskService, private noteService: NoteService) {}

  addTask() {
    this.taskService.createTask({
      title: this.newTaskTitle.trim() || 'Untitled task',
      description: 'Captured from the dashboard quick entry.',
      priority: 'medium',
      status: 'todo',
      dueDate: new Date(Date.now() + 86400000),
      tags: ['quick-capture'],
      subtasks: [{ id: `${Date.now()}-1`, title: 'Clarify next step', completed: false }],
      attachments: []
    });
    this.newTaskTitle = '';
  }

  addNote() {
    this.noteService.createNote({
      title: this.newNoteTitle.trim() || 'Untitled note',
      content: 'Start with a thought, then turn it into actions.',
      folder: 'Inbox',
      tags: ['quick-note'],
      isPinned: true,
      attachments: []
    });
    this.newNoteTitle = '';
  }
}

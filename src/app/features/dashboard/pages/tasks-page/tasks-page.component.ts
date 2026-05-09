import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Task } from '../../../../core/models/task.model';
import { TaskService } from '../../../../core/services/task/task.service';

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule
  ],
  templateUrl: './tasks-page.component.html',
  styleUrls: ['./tasks-page.component.scss']
})
export class TasksPageComponent {
  newTaskTitle = '';
  activeView = signal<'kanban' | 'list' | 'calendar'>('kanban');
  readonly weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  readonly columns: Array<{ label: string; status: Task['status']; icon: string }> = [
    { label: 'To Do', status: 'todo', icon: 'radio_button_unchecked' },
    { label: 'In Progress', status: 'in-progress', icon: 'pending_actions' },
    { label: 'Done', status: 'done', icon: 'task_alt' }
  ];

  activeTasks = computed(() => this.taskService.getTasks()().filter(task => task.status !== 'archived'));
  completedTasks = computed(() => this.taskService.getTasks()().filter(task => task.status === 'done').length);
  overdueTasks = computed(() => this.taskService.getOverdueTasks().length);

  constructor(private taskService: TaskService) {}

  tasksByStatus(status: Task['status']) {
    return this.activeTasks().filter(task => task.status === status);
  }

  addTask() {
    this.taskService.createTask({
      title: this.newTaskTitle.trim() || 'Untitled task',
      description: 'New task captured from the task workspace.',
      priority: 'medium',
      status: 'todo',
      dueDate: new Date(Date.now() + 86400000),
      tags: ['task-page'],
      subtasks: [
        { id: `${Date.now()}-1`, title: 'Define outcome', completed: false },
        { id: `${Date.now()}-2`, title: 'Schedule next action', completed: false }
      ],
      attachments: []
    });
    this.newTaskTitle = '';
  }

  dropTask(event: CdkDragDrop<Task[]>, status: Task['status']) {
    const task = event.item.data as Task;
    this.moveTask(task, status);
  }

  moveTask(task: Task, status: Task['status']) {
    this.taskService.updateTask(task.id, { status });
  }

  archiveTask(task: Task) {
    this.taskService.archiveTask(task.id);
  }

  deleteTask(task: Task) {
    this.taskService.deleteTask(task.id);
  }

  toggleSubtask(task: Task, subtaskId: string) {
    const subtasks = task.subtasks.map(subtask =>
      subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
    );
    const status = subtasks.every(subtask => subtask.completed) ? 'done' : task.status;
    this.taskService.updateTask(task.id, { subtasks, status });
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
}

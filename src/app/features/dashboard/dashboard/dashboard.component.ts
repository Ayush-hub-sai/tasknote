import { Component, HostListener, ViewEncapsulation, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AgentMessage } from '../../../core/models/agent.model';
import { AgentService } from '../../../core/services/agent/agent.service';
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
    MatFormFieldModule,
    MatInputModule,
    MatSidenavModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    CommandBarComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent {
  readonly navItems = [
    { label: 'Dashboard', route: '/dashboard', icon: 'space_dashboard' },
    { label: 'Tasks', route: '/tasks', icon: 'checklist' },
    { label: 'Notes', route: '/notes', icon: 'sticky_note_2' },
    { label: 'Media', route: '/media', icon: 'perm_media' },
    { label: 'Theme', route: '/theme', icon: 'palette' }
  ];

  agentOpen = false;
  shortcutsOpen = false;
  onboardingOpen = typeof localStorage === 'undefined' ? false : !localStorage.getItem('tasknote-onboarded');
  newMessage = '';
  messages = signal<AgentMessage[]>([]);

  constructor(private agentService: AgentService) {}

  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {
    if (event.key === '?' && !this.isTyping(event)) {
      event.preventDefault();
      this.shortcutsOpen = true;
    }

    if (event.key === 'Escape') {
      this.shortcutsOpen = false;
      if (this.agentOpen) {
        this.agentOpen = false;
      }
    }
  }

  toggleAgent() {
    this.agentOpen = !this.agentOpen;
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
        observable = this.agentService.sendMessage('Create subtasks for the highest priority active task.');
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

  private isTyping(event: KeyboardEvent) {
    const target = event.target as HTMLElement | null;
    return !!target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
  }
}

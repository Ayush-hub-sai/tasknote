import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        title: 'TaskNote Dashboard',
        loadComponent: () => import('./features/dashboard/pages/dashboard-home/dashboard-home.component').then(m => m.DashboardHomeComponent)
      },
      {
        path: 'tasks',
        title: 'TaskNote Tasks',
        loadComponent: () => import('./features/dashboard/pages/tasks-page/tasks-page.component').then(m => m.TasksPageComponent)
      },
      {
        path: 'notes',
        title: 'TaskNote Notes',
        loadComponent: () => import('./features/dashboard/pages/notes-page/notes-page.component').then(m => m.NotesPageComponent)
      },
      {
        path: 'media',
        title: 'TaskNote Media',
        loadComponent: () => import('./features/dashboard/pages/media-page/media-page.component').then(m => m.MediaPageComponent)
      },
      {
        path: 'theme',
        title: 'TaskNote Theme Studio',
        loadComponent: () => import('./features/dashboard/pages/theme-page/theme-page.component').then(m => m.ThemePageComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];

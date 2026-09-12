import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'staff' },
  {
    path: 'staff',
    title: 'Nhân viên | Task Management',
    loadComponent: () => import('./features/staff/pages/staff-page').then((m) => m.StaffPage),
  },
  {
    path: 'tasks',
    title: 'Công việc | Task Management',
    loadComponent: () => import('./features/tasks/pages/tasks-page').then((m) => m.TasksPage),
  },
  {
    path: '**',
    title: 'Không tìm thấy trang | Task Management',
    loadComponent: () => import('./shared/pages/not-found-page').then((m) => m.NotFoundPage),
  },
];

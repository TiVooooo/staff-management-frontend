import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'staff' },
  {
    path: 'staff',
    title: 'Nhân viên | Task Management',
    loadComponent: () => import('./features/staff/pages/staff-page').then((m) => m.StaffPage),
  },
];

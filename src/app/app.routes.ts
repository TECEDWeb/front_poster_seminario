import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: '',
    loadChildren: () =>
      import('./features/public/public.routes').then(
        m => m.PUBLIC_ROUTES
      )
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.page').then(
        m => m.LoginPage
      )
  },

  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes').then(
        m => m.ADMIN_ROUTES
      )
  },

  {
    path: 'evaluador',
    loadChildren: () =>
      import('./features/evaluador/evaluador.routes').then(
        m => m.EVALUADOR_ROUTES
      )
  },

  {
    path: '**',
    redirectTo: ''
  }

];
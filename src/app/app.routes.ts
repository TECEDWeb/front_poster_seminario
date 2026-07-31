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
    path: 'recuperar-password',
    loadComponent: () =>
      import('./features/auth/recuperar-password/recuperar-password.page').then(
        m => m.RecuperarPasswordPage
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

  // ✅ NUEVA RUTA PARA COORDINADOR
  {
    path: 'coordinador',
    loadChildren: () =>
      import('./features/coordinador/coordinador.routes').then(
        m => m.COORDINADOR_ROUTES
      )
  },

  {
    path: '**',
    redirectTo: ''
  }

];
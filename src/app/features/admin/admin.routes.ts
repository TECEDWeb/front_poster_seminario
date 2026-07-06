import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [

  {
    path: '',
    loadComponent: () =>
      import('../layouts/admin-layout/admin-layout.page')
        .then(m => m.AdminLayoutPage),
    children: [

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dasboard/dashboard.page')
            .then(m => m.DashboardPage)
      },

      {
        path: 'usuarios',
        loadComponent: () =>
          import('./usuarios/usuarios.page')
            .then(m => m.UsuariosPage)
      },

      {
        path: 'concursos',
        loadComponent: () =>
          import('./concursos/concursos.page')
            .then(m => m.ConcursosPage)
      },

      {
        path: 'proyectos',
        loadComponent: () =>
          import('./proyectos/proyectos.page')
            .then(m => m.ProyectosPage)
      },

      {
        path: 'rubricas',
        loadComponent: () =>
          import('./rubricas/rubricas.page')
            .then(m => m.RubricasPage)
      },

      {
        path: 'reportes',
        loadComponent: () =>
          import('./reportes/reportes.page')
            .then(m => m.ReportesPage)
      },
      {
        path: 'asignaciones',
        loadComponent: () =>
          import('./asignaciones/asignaciones.page')
            .then(m => m.AsignacionesPage)
      }

    ]
  }

];
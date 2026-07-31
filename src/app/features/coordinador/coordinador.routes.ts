import { Routes } from '@angular/router';

export const COORDINADOR_ROUTES: Routes = [

  {
    path: '',
    loadComponent: () =>
      import('../layouts/coordinador-layout/coordinador-layout.page')
        .then(m => m.CoordinadorLayoutPage),
    children: [

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.page')
            .then(m => m.DashboardPage)
      },

      {
        path: 'proyectos',
        loadComponent: () =>
          import('./proyectos/proyectos.page')
            .then(m => m.ProyectosPage)
      },

      {
        path: 'reportes',
        loadComponent: () =>
          import('./reportes/reportes.page')
            .then(m => m.ReportesPage)
      },

      {
        path: 'certificados',
        children: [
          {
            path: '',
            redirectTo: 'gestion',
            pathMatch: 'full'
          },
          {
            path: 'gestion',
            loadComponent: () =>
              import('./certificados/gestion/gestion-certificados.page')
                .then(m => m.GestionCertificadosPage)
          },
          {
            path: 'generar',
            loadComponent: () =>
              import('./certificados/generar/generacion-certificado.page')
                .then(m => m.GeneracionCertificadoPage)
          }
        ]
      },

      {
        path: 'evaluadores',
        loadComponent: () =>
          import('./evaluadores/evaluadores.page')
            .then(m => m.EvaluadoresPage)
      }

    ]
  }

];
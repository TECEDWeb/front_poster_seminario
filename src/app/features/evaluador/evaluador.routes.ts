import { Routes } from '@angular/router';

export const EVALUADOR_ROUTES: Routes = [

  {
    path: '',
    loadComponent: () =>
      import('../layouts/evaluador-layout/evaluador-layout.page')
        .then(m => m.EvaluadorLayoutPage),

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
        path: 'proyectos-asignados',
        loadComponent: () =>
          import('./proyectos-asignados/proyectos-asignados.page')
            .then(m => m.ProyectosAsignadosPage)
      },

      {
        path: 'formulario-evaluacion/:id',
        loadComponent: () =>
          import('./formulario-evaluacion/formulario-evaluacion.page')
            .then(m => m.FormularioEvaluacionPage)
      },

      {
        path: 'mis-resultados',
        loadComponent: () =>
          import('./mis-resultados/mis-resultados.page')
            .then(m => m.MisResultadosPage)
      },

      {
        path: 'mis-certificados',
        loadComponent: () =>
          import('./mis-certificados/mis-certificados.page')
            .then(m => m.MisCertificadosPage)
      }

    ]
  }

];
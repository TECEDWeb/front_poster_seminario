import { Routes } from '@angular/router';

export const PUBLIC_ROUTES: Routes = [

  {
    path: '',
    loadComponent: () =>
      import('../layouts/public-layout/public-layout.page')
        .then(m => m.PublicLayoutPage),

    children: [

      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
      },

      {
        path: 'inicio',
        loadComponent: () =>
          import('./inicio/inicio.page')
            .then(m => m.InicioPage)
      },

      {
        path: 'consulta-certificados',
        loadComponent: () =>
          import('./consulta-certificados/consulta-certificados.page')
            .then(m => m.ConsultaCertificadosPage)
      },

    ]
  }

];
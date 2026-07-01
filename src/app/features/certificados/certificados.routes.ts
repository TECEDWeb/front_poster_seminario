import { Routes } from '@angular/router';

export const CERTIFICADOS_ROUTES: Routes = [

  {
    path: '',
    children: [

      {
        path: '',
        redirectTo: 'validacion',
        pathMatch: 'full'
      },

      {
        path: 'generacion',
        loadComponent: () =>
          import('./generacion/generacion-certificado.page')
            .then(m => m.GeneracionCertificadoPage)
      },

      {
        path: 'validacion',
        loadComponent: () =>
          import('./validacion/validacion-certificado.page')
            .then(m => m.ValidacionCertificadoPage)
      }

    ]

  }

];
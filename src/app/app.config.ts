import { ApplicationConfig } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { RouteReuseStrategy } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [

    // Ionic
    provideIonicAngular(),

    // Router
    provideRouter(
      routes,
      withPreloading(PreloadAllModules)
    ),

    // HTTP + Interceptors
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

    // Ionic routing strategy
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    }

  ]
};
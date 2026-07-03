import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { RouteReuseStrategy } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { StorageService } from './core/services/storage.service';

export function initApp(storage: StorageService) {
  return () => storage.init();
}

export const appConfig: ApplicationConfig = {
  providers: [

    provideIonicAngular(),

    provideRouter(
      routes,
      withPreloading(PreloadAllModules)
    ),

    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      deps: [StorageService],
      multi: true
    },

    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    }

  ]
};
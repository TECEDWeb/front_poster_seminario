import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

console.log('==============================');
console.log('MAIN.TS - Inicio de la aplicación');
console.log('User Agent:', navigator.userAgent);
console.log('URL:', window.location.href);
console.log('==============================');

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    console.log('Angular bootstrap completado correctamente.');
  })
  .catch((err) => {
    console.error('Error durante bootstrapApplication:', err);
  });

console.log('MAIN.TS - bootstrapApplication() ejecutado.');
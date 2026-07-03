import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { from, switchMap, catchError, throwError } from 'rxjs';
import { StorageService } from '../services/storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const storage = inject(StorageService);
  const router = inject(Router);

  const esLogin = req.url.includes('/auth/login');

  return from(storage.getToken()).pipe(
    switchMap(token => {

      let request = req;

      if (!esLogin && token) {
        request = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }

      return next(request);
    }),
    catchError(error => {

      console.log('HTTP ERROR DETECTADO:', error);

      if (error?.status === 401) {
        storage.clear();
        router.navigate(['/login'], { replaceUrl: true });
      }

      return throwError(() => error);
    })
  );
};
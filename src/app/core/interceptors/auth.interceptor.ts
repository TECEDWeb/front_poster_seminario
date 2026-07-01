import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const apiUrl = environment.apiUrl;

  const esApi = apiUrl ? req.url.startsWith(apiUrl) : false;

  const esLogin = req.url.includes('/auth/login');

  if (!esApi || esLogin) {
    return next(req);
  }

  const token = authService.obtenerToken?.();

  let request = req;

  if (token) {
    request = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(request).pipe(
    catchError((error) => {

      if (error?.status === 401) {
        try {
          authService.logout?.();
        } catch (e) {
          console.error('Error en logout:', e);
        }

        if (router.url !== '/login') {
          router.navigate(['/login']);
        }
      }

      console.error('HTTP Error:', error);

      return throwError(() => error);
    })
  );
};
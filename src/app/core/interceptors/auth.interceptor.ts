import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const token =
    authService.obtenerToken?.() ??
    localStorage.getItem('auth_token');

  const esLogin = req.url.includes('/auth/login');

  let request = req;

  console.log('📡 REQUEST:', {
    url: req.url,
    esLogin,
    tieneToken: !!token
  });

  if (!esLogin && token) {
    request = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(request).pipe(
    catchError((error) => {

      console.log('🧨 ERROR HTTP:', error);

      if (error?.status === 401) {
        console.log('🔴 401 - TOKEN INVÁLIDO');

        authService.logout?.();

        if (router.url !== '/login') {
          router.navigate(['/login'], { replaceUrl: true });
        }
      }

      if (error?.status === 403) {
        console.log('🟠 403 - SIN PERMISOS');
      }

      return throwError(() => error);
    })
  );
};
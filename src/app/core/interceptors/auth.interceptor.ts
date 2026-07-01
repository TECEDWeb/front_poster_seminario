import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.obtenerToken?.();

  // 🔥 SOLO EXCLUIR LOGIN
  const esLogin = req.url.includes('/auth/login');

  let request = req;

  if (!esLogin && token) {
    request = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(request).pipe(
    catchError((error) => {

      if (error?.status === 401 || error?.status === 403) {

        console.log('🔴 TOKEN INVALIDO O SIN PERMISOS');

        authService.logout?.();

        if (router.url !== '/login') {
          router.navigate(['/login'], { replaceUrl: true });
        }
      }

      console.error('HTTP Error:', error);

      return throwError(() => error);
    })
  );
};
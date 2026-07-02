import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.obtenerToken?.();

  // 🔥 EXCLUIR SOLO LOGIN
  const esLogin = req.url.includes('/auth/login');

  let request = req;

  // 📡 LOG DEBUG REQUEST
  console.log('📡 HTTP REQUEST:', {
    url: req.url,
    method: req.method,
    esLogin,
    tieneToken: !!token
  });

  // 🔐 INYECTAR TOKEN
  if (!esLogin && token) {
    request = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(request).pipe(
    catchError((error) => {

      // 🧨 LOG COMPLETO DEL ERROR
      console.log('🧨 HTTP ERROR DETECTADO:', {
        status: error?.status,
        url: error?.url,
        message: error?.message,
        error: error?.error
      });

      // 🔴 401 = TOKEN INVALIDO → LOGOUT
      if (error?.status === 401) {

        console.log('🔴 401 - TOKEN INVÁLIDO');

        authService.logout?.();

        if (router.url !== '/login') {
          router.navigate(['/login'], { replaceUrl: true });
        }
      }

      // 🟠 403 = SIN PERMISOS → NO LOGOUT (IMPORTANTE)
      if (error?.status === 403) {

        console.log('🟠 403 - SIN PERMISOS (NO SE CIERRA SESIÓN)');
      }

      return throwError(() => error);
    })
  );
};
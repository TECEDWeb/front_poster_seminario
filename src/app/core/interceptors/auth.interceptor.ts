import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { from, switchMap, catchError, throwError, of } from 'rxjs';
import { StorageService } from '../services/storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const storage = inject(StorageService);
  const router = inject(Router);

  // Excluir rutas públicas
  const esLogin = req.url.includes('/auth/login');
  const esRegister = req.url.includes('/auth/register');
  const esOlvidePassword = req.url.includes('/auth/olvide-password');
  const esResetPassword = req.url.includes('/auth/resetear-password');
  const esPublica = esLogin || esRegister || esOlvidePassword || esResetPassword;

  return from(storage.getToken()).pipe(
    switchMap(token => {
      console.log('🔐 Interceptor - Token obtenido:', token ? '✅ Existe' : '❌ No existe');
      
      let request = req;

      if (!esPublica && token) {
        request = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('🔐 Interceptor - Token agregado a la petición');
      } else if (!esPublica && !token) {
        console.warn('⚠️ Interceptor - No hay token para petición protegida');
      }

      return next(request);
    }),
    catchError(error => {
      console.log('❌ HTTP ERROR DETECTADO:', error);

      if (error?.status === 401) {
        console.log('🔐 Token expirado o inválido - Redirigiendo a login');
        storage.clear();
        router.navigate(['/login'], { replaceUrl: true });
      }

      return throwError(() => error);
    })
  );
};
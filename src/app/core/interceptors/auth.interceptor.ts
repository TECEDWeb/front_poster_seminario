import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { from, switchMap, catchError, throwError } from 'rxjs';
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

  console.log('========================================');
  console.log('🔐 INTERCEPTOR ACTIVADO');
  console.log('📌 URL:', req.url);
  console.log('📌 Método:', req.method);
  console.log('📌 Es pública:', esPublica);
  console.log('========================================');

  return from(storage.getToken()).pipe(
    switchMap(token => {
      console.log('📌 Token obtenido del storage:', token ? '✅ Existe' : '❌ NO EXISTE');
      if (token) {
        console.log('📌 Token (primeros 30 chars):', token.substring(0, 30) + '...');
      }
      
      let request = req;

      if (!esPublica && token) {
        request = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('✅ Token agregado a la petición');
      } else if (!esPublica && !token) {
        console.warn('⚠️ No hay token para petición protegida:', req.url);
      } else {
        console.log('ℹ️ Petición pública, no se agrega token');
      }

      console.log('📤 Enviando petición a:', request.url);
      return next(request);
    }),
    catchError(error => {
      console.log('❌ ERROR HTTP DETECTADO:');
      console.log('   Status:', error?.status);
      console.log('   Mensaje:', error?.message);
      console.log('   URL:', req.url);

      if (error?.status === 401) {
        console.log('🔴 Token inválido o expirado - Redirigiendo a login');
        storage.clear();
        router.navigate(['/login'], { replaceUrl: true });
      }

      return throwError(() => error);
    })
  );
};
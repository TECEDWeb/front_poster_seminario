import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {

  const router = inject(Router);
  const authService = inject(AuthService);

  // Esperar a que el auth service esté inicializado
  if (authService.inicializando()) {
    // Esperar un poco si está inicializando
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Verificar si está autenticado
  if (authService.isAuthenticated()) {
    return true;
  }

  // Si no está autenticado, redirigir al login
  router.navigate(['/login'], { replaceUrl: true });
  return false;
};
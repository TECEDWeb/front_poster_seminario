import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = async (route) => {

  const router = inject(Router);
  const authService = inject(AuthService);

  // Esperar a que el auth service esté inicializado
  if (authService.inicializando()) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Verificar si está autenticado
  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }

  // Obtener roles permitidos de la ruta
  const rolesPermitidos = route.data?.['roles'] as string[] || [];

  // Si no hay roles específicos, permitir acceso
  if (rolesPermitidos.length === 0) {
    return true;
  }

  // Verificar si el usuario tiene el rol permitido
  const usuario = authService.obtenerUsuario();
  if (usuario && rolesPermitidos.includes(usuario.rol)) {
    return true;
  }

  // Si no tiene permiso, redirigir a la página de inicio según su rol
  const rutaInicio = authService.rutaInicioSegunRol();
  router.navigate([rutaInicio], { replaceUrl: true });
  return false;
};
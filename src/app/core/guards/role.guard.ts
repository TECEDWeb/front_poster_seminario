import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {

  const router = inject(Router);
  const authService = inject(AuthService);

  const usuario = authService.obtenerUsuario();

  if (!usuario) {
    router.navigate(['/login']);
    return false;
  }

  const rolesPermitidos = route.data?.['roles'] as string[] || [];

  if (
    rolesPermitidos.length === 0 ||
    rolesPermitidos.includes(usuario.rol)
  ) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
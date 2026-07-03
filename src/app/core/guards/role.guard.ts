import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

export const roleGuard: CanActivateFn = async (route) => {

  const router = inject(Router);
  const storage = inject(StorageService);

  const usuario = await storage.getUsuario();

  if (!usuario) {
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }

  const rolesPermitidos = route.data?.['roles'] as string[] || [];

  if (
    rolesPermitidos.length === 0 ||
    rolesPermitidos.includes(usuario.rol)
  ) {
    return true;
  }

  router.navigate(['/login'], { replaceUrl: true });
  return false;
};
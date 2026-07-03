import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

export const authGuard: CanActivateFn = async () => {

  const router = inject(Router);
  const storage = inject(StorageService);

  const token = await storage.getToken();

  if (token) return true;

  router.navigate(['/login'], { replaceUrl: true });
  return false;
};
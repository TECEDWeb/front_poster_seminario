import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  private authService = inject(AuthService);
  private router = inject(Router);

  usuario = this.authService.usuario;

  iniciales = computed(() => {
    const u = this.usuario();
    if (!u?.nombre) return '';

    return u.nombre
      .split(' ')
      .map(p => p[0])
      .join('')
      .toUpperCase();
  });

  async cerrarSesion() {
    await this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
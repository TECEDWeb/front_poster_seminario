import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { computed } from '@angular/core'; 
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule], // ← RouterModule aquí
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
    this.router.navigate(['/login']);
  }
}
import { Component, inject, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonButton,
  IonIcon,
  IonButtons,
  IonMenuButton,
  IonRouterOutlet
} from '@ionic/angular/standalone';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonButton,
    IonIcon,
    IonButtons,
    IonMenuButton,
    IonRouterOutlet
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  private authService = inject(AuthService);
  private router = inject(Router);

  usuario = this.authService.usuario;
  isMobile: boolean = window.innerWidth < 992;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth < 992;
  }

  iniciales = computed(() => {
    const u = this.usuario();
    if (!u?.nombre) return '';
    return u.nombre
      .split(' ')
      .map(p => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });

  async cerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      await this.authService.logout();
      this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }
}
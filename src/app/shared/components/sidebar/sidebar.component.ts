import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenuController } from '@ionic/angular';

import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonContent,
  IonList,
  IonItem,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  grid, gridOutline,
  people, peopleOutline,
  trophy, trophyOutline,
  folderOpen, folderOpenOutline,
  barChart, barChartOutline,
  checkbox, checkboxOutline,
  swapHorizontal, swapHorizontalOutline,
  clipboard, clipboardOutline,
  statsChart, statsChartOutline,
  logOutOutline,
  chevronDownOutline
} from 'ionicons/icons';

import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
  iconActive: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonContent,
    IonList,
    IonItem,
    IonButton,
    IonIcon
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  private authService = inject(AuthService);
  private router = inject(Router);
  private menuCtrl = inject(MenuController);

  usuario = this.authService.usuario;
  userMenuOpen = false;

  adminMenuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'grid-outline', iconActive: 'grid' },
    { label: 'Usuarios', route: '/admin/usuarios', icon: 'people-outline', iconActive: 'people' },
    { label: 'Concursos', route: '/admin/concursos', icon: 'trophy-outline', iconActive: 'trophy' },
    { label: 'Proyectos', route: '/admin/proyectos', icon: 'folder-open-outline', iconActive: 'folder-open' },
    { label: 'Reportes', route: '/admin/reportes', icon: 'bar-chart-outline', iconActive: 'bar-chart' },
    { label: 'Rúbricas', route: '/admin/rubricas', icon: 'checkbox-outline', iconActive: 'checkbox' },
    { label: 'Asignaciones', route: '/admin/asignaciones', icon: 'swap-horizontal-outline', iconActive: 'swap-horizontal' },
  ];

  evaluadorMenuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/evaluador/dashboard', icon: 'grid-outline', iconActive: 'grid' },
    { label: 'Proyectos', route: '/evaluador/proyectos-asignados', icon: 'clipboard-outline', iconActive: 'clipboard' },
    { label: 'Resultados', route: '/evaluador/mis-resultados', icon: 'stats-chart-outline', iconActive: 'stats-chart' },
  ];

  constructor() {
    addIcons({
      grid, 'grid-outline': gridOutline,
      people, 'people-outline': peopleOutline,
      trophy, 'trophy-outline': trophyOutline,
      'folder-open': folderOpen, 'folder-open-outline': folderOpenOutline,
      'bar-chart': barChart, 'bar-chart-outline': barChartOutline,
      checkbox, 'checkbox-outline': checkboxOutline,
      'swap-horizontal': swapHorizontal, 'swap-horizontal-outline': swapHorizontalOutline,
      clipboard, 'clipboard-outline': clipboardOutline,
      'stats-chart': statsChart, 'stats-chart-outline': statsChartOutline,
      'log-out-outline': logOutOutline,
      'chevron-down-outline': chevronDownOutline
    });

    document.addEventListener('click', (e: MouseEvent) => {
      if (this.userMenuOpen && !(e.target as HTMLElement).closest('.user-menu-wrapper')) {
        this.userMenuOpen = false;
      }
    });
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

  toggleUserMenu(event: MouseEvent) {
    event.stopPropagation();
    this.userMenuOpen = !this.userMenuOpen;
  }

  cerrarMenu() {
    this.menuCtrl.close('main-menu');
  }

  async cerrarSesion() {
    this.userMenuOpen = false;
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      await this.authService.logout();
      this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }
}
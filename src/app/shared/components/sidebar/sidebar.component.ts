import { Component, inject, computed, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { Subscription, filter } from 'rxjs';

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
  ribbon, ribbonOutline,
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

// Debe coincidir con el breakpoint del SCSS (992px) donde el menú
// horizontal de escritorio toma el control y el ion-menu móvil deja
// de aplicar.
const DESKTOP_BREAKPOINT = 992;

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
export class SidebarComponent implements OnInit, OnDestroy {

  private authService = inject(AuthService);
  private router = inject(Router);
  private menuCtrl = inject(MenuController);

  // Referencia directa al ion-menu del template (ver #mainMenu en el HTML).
  // Usamos esto ADEMÁS de MenuController porque en algunos casos
  // menuCtrl.close('main-menu') falla silenciosamente por timing o
  // por desajuste de registro del menú, sin lanzar ningún error.
  // Llamando directamente sobre la instancia evitamos ese problema.
  @ViewChild('mainMenu') menuRef?: IonMenu;

  usuario = this.authService.usuario;
  userMenuOpen = false;

  private routerSubscription?: Subscription;

  adminMenuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'grid-outline', iconActive: 'grid' },
    { label: 'Usuarios', route: '/admin/usuarios', icon: 'people-outline', iconActive: 'people' },
    { label: 'Concursos', route: '/admin/concursos', icon: 'trophy-outline', iconActive: 'trophy' },
    { label: 'Proyectos', route: '/admin/proyectos', icon: 'folder-open-outline', iconActive: 'folder-open' },
    { label: 'Reportes', route: '/admin/reportes', icon: 'bar-chart-outline', iconActive: 'bar-chart' },
    { label: 'Rúbricas', route: '/admin/rubricas', icon: 'checkbox-outline', iconActive: 'checkbox' },
    { label: 'Asignaciones', route: '/admin/asignaciones', icon: 'swap-horizontal-outline', iconActive: 'swap-horizontal' },
    { label: 'Certificados', route: '/admin/certificados', icon: 'ribbon-outline', iconActive: 'ribbon' },

  ];

  evaluadorMenuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/evaluador/dashboard', icon: 'grid-outline', iconActive: 'grid' },
    { label: 'Proyectos', route: '/evaluador/proyectos-asignados', icon: 'clipboard-outline', iconActive: 'clipboard' },
    { label: 'Resultados', route: '/evaluador/mis-resultados', icon: 'stats-chart-outline', iconActive: 'stats-chart' },
    { label: 'Certificados', route: '/evaluador/mis-certificados', icon: 'ribbon-outline', iconActive: 'ribbon' },

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
      ribbon, 'ribbon-outline': ribbonOutline,
      'log-out-outline': logOutOutline,
      'chevron-down-outline': chevronDownOutline
    });

    document.addEventListener('click', (e: MouseEvent) => {
      if (this.userMenuOpen && !(e.target as HTMLElement).closest('.user-menu-wrapper')) {
        this.userMenuOpen = false;
      }
    });
  }

  ngOnInit(): void {
    // Cierra el menú lateral automáticamente cada vez que una navegación
    // termina (NavigationEnd) — sin importar si el clic vino de un
    // ion-item, un routerLink, o cualquier otro disparador — pero SOLO
    // en viewport móvil, ya que en escritorio el menú horizontal es
    // estático y no debe verse afectado.
    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.esViewportMovil()) {
          this.cerrarMenu();
        }
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  private esViewportMovil(): boolean {
    return window.innerWidth < DESKTOP_BREAKPOINT;
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

  /**
   * Cierra el menú lateral usando DOS mecanismos en paralelo:
   * 1. La referencia directa al componente (this.menuRef.close()),
   *    que es más confiable porque actúa sobre la instancia real
   *    sin depender de que MenuController encuentre el menú por su id.
   * 2. MenuController.close('main-menu') como respaldo, por si el
   *    ViewChild aún no está disponible en algún punto del ciclo de vida.
   */
  cerrarMenu(): void {
    if (this.menuRef) {
      this.menuRef.close();
    } else {
      this.menuCtrl.close('main-menu');
    }
  }

  async cerrarSesion() {
    this.userMenuOpen = false;
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      await this.authService.logout();
      this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }
}
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

import { AuthService } from '../../../core/services/auth.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    IonApp,
    IonRouterOutlet,
    SidebarComponent
  ],
  templateUrl: './admin-layout.page.html',
})
export class AdminLayoutPage {

  private authService = inject(AuthService);
  private router = inject(Router);

  async cerrarSesion() {
    await this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
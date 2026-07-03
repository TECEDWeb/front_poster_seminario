import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { IonRouterOutlet } from '@ionic/angular/standalone';

import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonRouterOutlet,
    SidebarComponent
  ],
  templateUrl: './admin-layout.page.html',
  styleUrls: ['./admin-layout.page.scss']
})
export class AdminLayoutPage {}
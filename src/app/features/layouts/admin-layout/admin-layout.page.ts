import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import {
  IonApp,
  IonMenu,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonRouterOutlet,
  IonButtons,
  IonMenuButton
} from '@ionic/angular/standalone';

import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonApp,
    IonMenu,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonRouterOutlet,
    IonButtons,
    IonMenuButton,
    SidebarComponent
  ],
  templateUrl: './admin-layout.page.html',
  styleUrls: ['./admin-layout.page.scss']
})
export class AdminLayoutPage {}
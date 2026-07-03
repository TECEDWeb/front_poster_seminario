import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonIcon
} from '@ionic/angular/standalone';

import { StatsCardComponent } from '../../../shared/components/stats-card/stats-card.component';

import { addIcons } from 'ionicons';
import {
  personOutline,
  clipboardOutline,
  statsChartOutline,
  chevronForwardOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonIcon,
    StatsCardComponent
  ],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss']
})
export class DashboardPage {

  asignados = 0;
  pendientes = 0;
  completados = 0;

  constructor() {

    addIcons({
      personOutline,
      clipboardOutline,
      statsChartOutline,
      chevronForwardOutline
    });

  }

  get porcentaje(): number {
    if (this.asignados === 0) return 0;
    return Math.round((this.completados / this.asignados) * 100);
  }

}
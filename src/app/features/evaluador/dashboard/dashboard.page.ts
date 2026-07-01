import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { StatsCardComponent } from '../../../shared/components/stats-card/stats-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    StatsCardComponent
  ],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss']
})
export class DashboardPage {

  asignados = 0;
  pendientes = 0;
  completados = 0;

  // =========================
  // SOLUCIÓN: PORCENTAJE
  // =========================
  get porcentaje(): number {
    if (this.asignados === 0) return 0;
    return Math.round((this.completados / this.asignados) * 100);
  }
}
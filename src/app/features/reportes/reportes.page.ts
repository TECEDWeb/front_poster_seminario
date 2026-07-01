import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent
} from '@ionic/angular/standalone';

import { ReporteService } from 'src/app/core/services/reporte.service';
import { Reporte } from 'src/app/core/models/reporte.model';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,

    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent
  ],
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss']
})
export class ReportesPage implements OnInit {

  reportes: Reporte[] = [];

  constructor(private reporteService: ReporteService) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
  this.reporteService.getReportes().subscribe({
    next: (res: Reporte[]) => {
      this.reportes = res ?? [];
    },
    error: (err: any) => {
      console.error('Error cargando reportes públicos', err);
      this.reportes = [];
    }
  });
}
}
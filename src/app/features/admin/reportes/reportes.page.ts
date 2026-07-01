import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ReporteService } from '../../../core/services/reporte.service';
import { ReporteStats, Ranking } from 'src/app/core/models/reporte.model';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ],
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss']
})
export class ReportesPage implements OnInit {

  // ======================
  // STATS
  // ======================
  reportes: ReporteStats = {
    proyectos: 0,
    evaluaciones: 0
  };

  // ======================
  // RANKING
  // ======================
  ranking: Ranking[] = [];

  constructor(private reporteService: ReporteService) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {

    this.reporteService.getStats().subscribe({
      next: (res: any) => {
        this.reportes = {
          proyectos: res.proyectos ?? 0,
          evaluaciones: res.evaluaciones ?? 0,
          completadas: res.completadas ?? 0,
          promedio: res.promedio ?? 0
        } as ReporteStats;
      },
      error: (err) => {
        console.error('Error stats:', err);
      }
    });

    this.reporteService.getRanking().subscribe({
      next: (res: any) => {
        this.ranking = (res ?? []).map((r: any) => ({
          nombre: r.nombre,
          promedio: r.promedio,
          evaluadorNombre: r.evaluadorNombre ?? r.evaluador ?? null
        }));
      },
      error: (err) => {
        console.error('Error ranking:', err);
      }
    });

  }
}
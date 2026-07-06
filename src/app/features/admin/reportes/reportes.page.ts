import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonButton,
  IonIcon,
  IonContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  downloadOutline,
  statsChartOutline,
  folderOutline,
  checkmarkDoneOutline,
  trophyOutline,
  barChartOutline
} from 'ionicons/icons';
import { ReporteService } from '../../../core/services/reporte.service';
import { ReporteStats, Ranking } from 'src/app/core/models/reporte.model';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,

    // Ionic Standalone
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonButton,
    IonIcon,
    IonContent
  ],
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss']
})
export class ReportesPage implements OnInit {

  reportes: ReporteStats = {
    proyectos: 0,
    evaluaciones: 0
  };

  ranking: Ranking[] = [];

  constructor(
    private reporteService: ReporteService
  ) {

    addIcons({
      downloadOutline,
      statsChartOutline,
      folderOutline,
      checkmarkDoneOutline,
      trophyOutline,
      barChartOutline
    });

  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {

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

        const lista = res.data ?? [];

        this.ranking = lista.map((r: any) => ({
          nombre: r.nombre,
          promedio: Number(r.promedio),
          evaluadorNombre: r.calificacion
        }));

      },
      error: (err) => {

        console.error('Error ranking:', err);
        this.ranking = [];

      }

    });

  }

}
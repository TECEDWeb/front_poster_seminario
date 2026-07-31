import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonButton,
  IonIcon,
  IonContent,
  IonSkeletonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  statsChartOutline,
  downloadOutline,
  documentOutline,
  refreshOutline
} from 'ionicons/icons';
import { ReporteService } from '../../../core/services/reporte.service';
import { ConcursoService } from '../../../core/services/concurso.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonButton,
    IonIcon,
    IonContent,
    IonSkeletonText
  ],
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss']
})
export class ReportesPage implements OnInit {

  concursoAsignado: any = null;
  cargando: boolean = true;
  reportes: any = null;

  constructor(
    private reporteService: ReporteService,
    private concursoService: ConcursoService
  ) {
    addIcons({
      statsChartOutline,
      downloadOutline,
      documentOutline,
      refreshOutline
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;

    this.concursoService.listarActivos().subscribe({
      next: (concursos) => {
        if (concursos && concursos.length > 0) {
          this.concursoAsignado = concursos[0];
          this.cargarReportes(this.concursoAsignado.id);
        } else {
          this.cargando = false;
        }
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  cargarReportes(concursoId: number): void {
    this.reporteService.getStatsByConcurso(concursoId).subscribe({
      next: (res: any) => {
        this.reportes = res?.data ?? res;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  descargarPDF(): void {
    this.reporteService.exportarPDFConcurso(this.concursoAsignado.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte-${this.concursoAsignado.nombre}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        alert('Error al descargar el PDF');
      }
    });
  }

  descargarExcel(): void {
    this.reporteService.exportarExcelConcurso(this.concursoAsignado.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte-${this.concursoAsignado.nombre}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        alert('Error al descargar el Excel');
      }
    });
  }

  recargar(): void {
    this.cargarDatos();
  }
}
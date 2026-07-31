import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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
  gridOutline,
  folderOutline,
  peopleOutline,
  checkmarkDoneOutline,
  timeOutline,
  refreshOutline,
  statsChartOutline,
  ribbonOutline,
  trophyOutline,
  calendarOutline,
  documentTextOutline
} from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { ConcursoService } from '../../../core/services/concurso.service';
import { ReporteService } from '../../../core/services/reporte.service';

@Component({
  selector: 'app-dashboard',
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
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss']
})
export class DashboardPage implements OnInit {

  nombreUsuario: string = '';
  concursoAsignado: any = null;
  stats: any = {
    proyectos: 0,
    evaluadores: 0,
    evaluados: 0,
    pendientes: 0,
    total: 0,
    promedio: 0
  };
  porcentajeProgreso: number = 0;
  cargando: boolean = true;
  esCoordinador: boolean = true;

  constructor(
    private authService: AuthService,
    private concursoService: ConcursoService,
    private reporteService: ReporteService,
    private router: Router
  ) {
    addIcons({
      gridOutline,
      folderOutline,
      peopleOutline,
      checkmarkDoneOutline,
      timeOutline,
      refreshOutline,
      statsChartOutline,
      ribbonOutline,
      trophyOutline,
      calendarOutline,
      documentTextOutline
    });
  }

  ngOnInit(): void {
    this.nombreUsuario = this.authService.getNombreUsuario();
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;

    // Obtener concurso asignado al coordinador
    this.concursoService.listarActivos().subscribe({
      next: (concursos) => {
        if (concursos && concursos.length > 0) {
          this.concursoAsignado = concursos[0];
          this.cargarEstadisticas(this.concursoAsignado.id);
        } else {
          this.cargando = false;
        }
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  cargarEstadisticas(concursoId: number): void {
    this.reporteService.getStatsByConcurso(concursoId).subscribe({
      next: (res: any) => {
        const data = res?.data ?? res;
        this.stats = {
          proyectos: data?.proyectos || 0,
          evaluadores: data?.evaluadores || 0,
          evaluados: data?.evaluados || 0,
          pendientes: data?.pendientes || 0,
          total: data?.total || 0,
          promedio: data?.promedio || 0
        };
        this.porcentajeProgreso = this.stats.total > 0 
          ? Math.round((this.stats.evaluados / this.stats.total) * 100) 
          : 0;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  irA(ruta: string): void {
    this.router.navigate([`/coordinador/${ruta}`]);
  }

  recargar(): void {
    this.cargarDatos();
  }
}
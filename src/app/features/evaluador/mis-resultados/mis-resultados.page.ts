import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonSkeletonText,
  IonIcon,
  IonButton,
  IonChip,
  IonLabel,
  IonBadge,
  IonModal,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  personOutline,
  calendarOutline,
  barChartOutline,
  statsChartOutline,
  trophyOutline,
  documentTextOutline,
  timeOutline,
  eyeOutline,
  alertCircleOutline,
  closeOutline,
  filterOutline,
  refreshOutline,
  clipboardOutline,
  arrowForwardOutline,
  downloadOutline,
  printOutline,
  chatbubbleOutline,
  ellipseOutline
} from 'ionicons/icons';
import { EvaluacionService } from '../../../core/services/evaluacion.service';
import { ResumenEvaluacion } from '../../../core/models/evaluacion.model';

@Component({
  selector: 'app-mis-resultados',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonSkeletonText,
    IonIcon,
    IonButton,
    IonChip,
    IonLabel,
    IonBadge,
    IonModal,
    IonSpinner
  ],
  templateUrl: './mis-resultados.page.html',
  styleUrls: ['./mis-resultados.page.scss']
})
export class MisResultadosPage implements OnInit {

  evaluaciones: ResumenEvaluacion[] = [];
  evaluacionesFiltradas: ResumenEvaluacion[] = [];
  loading = true;
  error: string | null = null;

  totalEvaluaciones: number = 0;
  promedioGeneral: number = 0;
  evaluacionesRecientes: number = 0;

  filtroEstado: string = 'todos';

  modalAbierto = false;
  cargandoDetalle = false;
  errorDetalle: string | null = null;
  detalle: any = null;

  constructor(
    private evaluacionService: EvaluacionService,
    private router: Router
  ) {
    addIcons({
      checkmarkCircleOutline,
      personOutline,
      calendarOutline,
      barChartOutline,
      statsChartOutline,
      trophyOutline,
      documentTextOutline,
      timeOutline,
      eyeOutline,
      alertCircleOutline,
      closeOutline,
      filterOutline,
      refreshOutline,
      clipboardOutline,
      arrowForwardOutline,
      downloadOutline,
      printOutline,
      chatbubbleOutline,
      ellipseOutline
    });
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.error = null;

    this.evaluacionService.getMisResultados().subscribe({
      next: (res: any) => {
        console.log('MIS RESULTADOS API:', res);

        const data = res?.data ?? res ?? [];
        this.evaluaciones = Array.isArray(data) ? data : (data ? [data] : []);

        this.calcularEstadisticas();
        this.aplicarFiltros();

        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar evaluaciones', err);
        this.error = err.error?.mensaje || 'Error al cargar los resultados';
        this.evaluaciones = [];
        this.evaluacionesFiltradas = [];
        this.loading = false;
      }
    });
  }

  calcularEstadisticas(): void {
    this.totalEvaluaciones = this.evaluaciones.length;

    if (this.totalEvaluaciones > 0) {
      const sum = this.evaluaciones.reduce((acc, e) => acc + (e.porcentaje || 0), 0);
      this.promedioGeneral = Math.round(sum / this.totalEvaluaciones);
    } else {
      this.promedioGeneral = 0;
    }

    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);
    this.evaluacionesRecientes = this.evaluaciones.filter(e => {
      if (!e.fecha) return false;
      return new Date(e.fecha) >= hace7Dias;
    }).length;
  }

  aplicarFiltros(): void {
    let filtered = [...this.evaluaciones];

    if (this.filtroEstado === 'alto') {
      filtered = filtered.filter(e => (e.porcentaje || 0) >= 70);
    } else if (this.filtroEstado === 'medio') {
      filtered = filtered.filter(e => (e.porcentaje || 0) >= 50 && (e.porcentaje || 0) < 70);
    } else if (this.filtroEstado === 'bajo') {
      filtered = filtered.filter(e => (e.porcentaje || 0) < 50);
    }

    filtered.sort((a, b) => {
      if (!a.fecha) return 1;
      if (!b.fecha) return -1;
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    });

    this.evaluacionesFiltradas = filtered;
  }

  cambiarFiltro(estado: string): void {
    this.filtroEstado = estado;
    this.aplicarFiltros();
  }

  getEstadoClase(porcentaje: number): string {
    if (porcentaje >= 70) return 'status-excellent';
    if (porcentaje >= 50) return 'status-good';
    if (porcentaje >= 30) return 'status-regular';
    return 'status-low';
  }

  getEstadoTexto(porcentaje: number): string {
    if (porcentaje >= 70) return 'Excelente';
    if (porcentaje >= 50) return 'Bueno';
    if (porcentaje >= 30) return 'Regular';
    return 'Bajo';
  }

  getEstadoIcono(porcentaje: number): string {
    if (porcentaje >= 70) return 'checkmark-circle-outline';
    if (porcentaje >= 50) return 'time-outline';
    return 'alert-circle-outline';
  }

  getColorClase(porcentaje: number): string {
    if (porcentaje >= 70) return 'score-high';
    if (porcentaje >= 50) return 'score-mid';
    return 'score-low';
  }

  getProgressColor(porcentaje: number): string {
    if (porcentaje >= 70) return '#10b981';
    if (porcentaje >= 50) return '#f59e0b';
    return '#ef4444';
  }

  verDetalle(id: number): void {
    if (!id) return;

    this.modalAbierto = true;
    this.cargandoDetalle = true;
    this.errorDetalle = null;
    this.detalle = null;

    this.evaluacionService.getResultadoDetalle(id).subscribe({
      next: (res: any) => {
        console.log('DETALLE RESULTADO:', res);

        if (res?.ok === false) {
          this.errorDetalle = res.mensaje || 'No se pudo cargar el detalle';
          this.cargandoDetalle = false;
          return;
        }

        const data = res?.data ?? res;

        const seccionesMap: { [nombre: string]: any[] } = {};
        (data.detalles || []).forEach((d: any) => {
          if (!seccionesMap[d.seccion]) {
            seccionesMap[d.seccion] = [];
          }
          seccionesMap[d.seccion].push(d);
        });

        this.detalle = {
          rubricaNombre: data.rubricaNombre || 'Rúbrica de evaluación',
          proyectoNombre: data.proyectoNombre || 'Proyecto',
          concursoNombre: data.concursoNombre || '',
          observacion: data.observaciones || '',
          puntajeMaximo: data.puntajeMaximo,
          fecha: data.fecha,
          secciones: Object.keys(seccionesMap).map(nombre => ({
            nombre,
            items: seccionesMap[nombre]
          }))
        };

        this.cargandoDetalle = false;
      },
      error: (err) => {
        console.error('Error cargando detalle:', err);
        this.errorDetalle = err.error?.mensaje || 'Error al cargar el detalle';
        this.cargandoDetalle = false;
      }
    });
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.detalle = null;
    this.errorDetalle = null;
  }

  exportarResultado(id: number): void {
    console.log('Exportar resultado ID:', id);
    alert('Función de exportación en desarrollo');
  }

  recargar(): void {
    this.cargar();
  }

  getStatusIcon(porcentaje: number): string {
    return this.getEstadoIcono(porcentaje);
  }

  trackByEvaluacionId(index: number, item: ResumenEvaluacion): number {
    return item?.id ?? index;
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonChip,
  IonDatetime,
  IonLabel,
  IonSkeletonText,
  IonAlert
} from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  addOutline,
  swapHorizontalOutline,
  checkmarkCircleOutline,
  folderOutline,
  folderOpenOutline,
  peopleOutline,
  personOutline,
  calendarOutline,
  timeOutline,
  checkmarkDoneOutline,
  refreshOutline,
  arrowForwardOutline,
  personAddOutline,
  closeCircleOutline,
  alertCircleOutline,
  eyeOutline,
  informationCircleOutline,
  closeOutline,
  trashOutline,
  createOutline,
  personRemoveOutline,
  warningOutline
} from 'ionicons/icons';

import { ProyectoService } from '../../../core/services/proyecto.service';
import { AsignacionService } from '../../../core/services/asignacion.service';
import { EvaluacionService } from '../../../core/services/evaluacion.service';
import { AuthService } from '../../../core/services/auth.service';
import { UsuarioService } from '../../../core/services/usuario.service';

// ✅ IMPORTAR EL MODAL
import { AsignacionModalComponent } from '../../../shared/components/asignacion-modal/asignacion-modal.component';

@Component({
  selector: 'app-asignaciones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonChip,
    IonDatetime,
    IonLabel,
    IonSkeletonText,
    IonAlert,
    AsignacionModalComponent  // ✅ IMPORTAR EL MODAL
  ],
  templateUrl: './asignaciones.page.html',
  styleUrls: ['./asignaciones.page.scss']
})
export class AsignacionesPage implements OnInit {

  proyectos: any[] = [];
  evaluadores: any[] = [];

  asignacionesTodas: any[] = [];
  asignacionesRecientes: any[] = [];
  asignacionesCount: number = 0;

  cargandoAsignacionesProyecto: boolean = false;

  proyectoId: number | null = null;
  evaluadorId: number | null = null;
  fechaLimite: string | null = null;

  submitting: boolean = false;
  cargando: boolean = false;

  esAdmin: boolean = false;

  // ✅ CONTROL DEL MODAL
  modalAbierto = false;

  get proyectoSeleccionado(): any {
    if (!this.proyectoId) return null;
    return this.proyectos.find(p => p.id === this.proyectoId) || null;
  }

  get asignacionesDelProyecto(): any[] {
    if (!this.proyectoId) return [];
    return this.asignacionesTodas.filter(a => this.obtenerProyectoIdDeAsignacion(a) === this.proyectoId);
  }

  constructor(
    private proyectoService: ProyectoService,
    private asignacionService: AsignacionService,
    private evaluacionService: EvaluacionService,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private router: Router,
    private alertController: AlertController
  ) {
    addIcons({
      addOutline,
      swapHorizontalOutline,
      checkmarkCircleOutline,
      folderOutline,
      folderOpenOutline,
      peopleOutline,
      personOutline,
      calendarOutline,
      timeOutline,
      checkmarkDoneOutline,
      refreshOutline,
      arrowForwardOutline,
      personAddOutline,
      closeCircleOutline,
      alertCircleOutline,
      eyeOutline,
      informationCircleOutline,
      closeOutline,
      trashOutline,
      createOutline,
      personRemoveOutline,
      warningOutline
    });

    this.esAdmin = this.authService.esAdmin();
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  // ============================================
  // ABRIR / CERRAR MODAL
  // ============================================
  abrirModalAsignacion(): void {
    this.modalAbierto = true;
  }

  cerrarModalAsignacion(): void {
    this.modalAbierto = false;
  }

  onAsignacionCreada(event: any): void {
    console.log('✅ Asignación creada desde modal:', event);
    this.cargarDatos();
  }

  // ============================================
  // CARGA DE DATOS
  // ============================================
  cargarDatos(): void {
    this.cargando = true;
    this._proyectosListos = false;
    this._evaluadoresListos = false;
    this._asignacionesListas = false;

    this.cargarProyectos();
    this.cargarEvaluadores();
    this.cargarAsignacionesRecientes();

    clearTimeout(this._loadingSafety);
    this._loadingSafety = setTimeout(() => {
      if (this.cargando) {
        this.cargando = false;
        console.warn('Carga forzada por timeout');
      }
    }, 8000);
  }

  cargarProyectos(): void {
    this.proyectoService.listar().subscribe({
      next: (res: any) => {
        this.proyectos = res?.data ?? res?.proyectos ?? res ?? [];
        this._proyectosListos = true;
        this.verificarCargaCompleta();
      },
      error: (err: any) => {
        console.error('Error cargando proyectos:', err);
        this.proyectos = [];
        this._proyectosListos = true;
        this.verificarCargaCompleta();
      }
    });
  }

  cargarEvaluadores(): void {
    this.usuarioService.getEvaluadores().subscribe({
      next: (res: any) => {
        if (res && res.ok && res.data) {
          this.evaluadores = res.data;
        } else {
          this.evaluadores = [];
        }
        this._evaluadoresListos = true;
        this.verificarCargaCompleta();
      },
      error: (err: any) => {
        console.error('Error cargando evaluadores:', err);
        this.evaluadores = [];
        this._evaluadoresListos = true;
        this.verificarCargaCompleta();
      }
    });
  }

  cargarAsignacionesRecientes(): void {
    this.asignacionService.listar().subscribe({
      next: (res: any) => {
        const data = res?.data ?? res ?? [];
        this.asignacionesTodas = Array.isArray(data) ? data : [];
        this.asignacionesRecientes = this.asignacionesTodas.slice(0, 5);
        this.asignacionesCount = this.asignacionesTodas.length;
        this._asignacionesListas = true;
        this.verificarCargaCompleta();
      },
      error: (err: any) => {
        console.error('Error cargando asignaciones:', err);
        this.asignacionesTodas = [];
        this.asignacionesRecientes = [];
        this.asignacionesCount = 0;
        this._asignacionesListas = true;
        this.verificarCargaCompleta();
      }
    });
  }

  private _proyectosListos = false;
  private _evaluadoresListos = false;
  private _asignacionesListas = false;
  private _loadingSafety: any;

  verificarCargaCompleta(): void {
    if (this._proyectosListos && this._evaluadoresListos && this._asignacionesListas) {
      clearTimeout(this._loadingSafety);
      this.cargando = false;
    }
  }

  private obtenerProyectoIdDeAsignacion(a: any): number | null {
    const valor = a.proyecto_id ?? a.proyectoId ?? a.proyecto?.id ?? null;
    return valor != null ? Number(valor) : null;
  }

  onProyectoSeleccionado(event: any): void {
    this.evaluadorId = null;
  }

  // ============================================
  // GUARDAR ASIGNACIÓN
  // ============================================
  guardar(): void {
    if (!this.proyectoId) {
      this.showError('Por favor, selecciona un proyecto');
      return;
    }

    if (!this.evaluadorId) {
      this.showError('Por favor, selecciona un evaluador');
      return;
    }

    const evaluador = this.evaluadores.find(e => e.id === this.evaluadorId);
    if (!evaluador) {
      this.showError('El evaluador seleccionado no es válido');
      return;
    }

    const proyecto = this.proyectos.find(p => p.id === this.proyectoId);
    if (!proyecto) {
      this.showError('El proyecto seleccionado no es válido');
      return;
    }

    const yaAsignado = this.asignacionesDelProyecto.some(a => {
      const evalId = a.evaluador_id ?? a.evaluadorId ?? a.evaluador?.id;
      return Number(evalId) === Number(this.evaluadorId);
    });

    if (yaAsignado) {
      if (!confirm(`${evaluador.nombre} ya está asignado a este proyecto. ¿Deseas asignarlo de nuevo de todas formas?`)) {
        return;
      }
    }

    this.submitting = true;

    const payload = {
      proyectoId: this.proyectoId,
      evaluadorId: this.evaluadorId
    };

    this.asignacionService.asignar(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.showSuccess('Proyecto asignado correctamente al evaluador');
        this.resetForm();
        setTimeout(() => this.cargarDatos(), 500);
      },
      error: (err: any) => {
        this.submitting = false;
        console.error('Error asignando:', err);

        let mensaje = err.error?.mensaje || err.error?.error || 'Error al asignar el proyecto';

        if (mensaje.includes('rúbrica') || mensaje.includes('rubrica')) {
          mensaje = 'El proyecto no tiene una rúbrica asociada. Por favor, crea una rúbrica primero.';
        } else if (mensaje.includes('ya asignado') || mensaje.includes('Ya existe')) {
          mensaje = 'Este proyecto ya fue asignado a este evaluador.';
        } else if (mensaje.includes('evaluador') && mensaje.includes('no encontrado')) {
          mensaje = 'El evaluador seleccionado no está disponible o no existe.';
        } else if (mensaje.includes('secciones')) {
          mensaje = 'La rúbrica no tiene secciones configuradas. Ve a Rúbricas → Configurar contenido primero.';
        }

        this.showError(mensaje);
      }
    });
  }

  // ============================================
  // QUITAR ASIGNACIÓN
  // ============================================
  async quitarAsignacion(a: any): Promise<void> {
    const evaluacionId = a.id || a.evaluacion_id;
    if (!evaluacionId) {
      this.showError('No se encontró el ID de esta asignación');
      return;
    }

    const nombreEvaluador = a.evaluador_nombre || a.evaluador?.nombre || 'este evaluador';
    const nombreProyecto = a.proyecto_nombre || a.proyecto?.nombre || 'este proyecto';
    
    const yaEvaluado = a.status === 'completed' || a.status === 'completado'
      || a.estado === 'evaluado' || a.yaEvaluado === true;

    const alert = await this.alertController.create({
      header: yaEvaluado ? '⚠️ Eliminar evaluación' : 'Quitar asignación',
      subHeader: `Proyecto: ${nombreProyecto}`,
      message: yaEvaluado
        ? `El evaluador <strong>"${nombreEvaluador}"</strong> YA REGISTRÓ una evaluación para este proyecto.<br><br>Quitar esta asignación <strong>BORRARÁ</strong> también sus respuestas guardadas. ¿Continuar de todas formas?`
        : `¿Quitar la asignación de <strong>"${nombreEvaluador}"</strong> para el proyecto "${nombreProyecto}"?<br><br>Esta asignación aún no tiene evaluación registrada, así que es seguro quitarla.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: yaEvaluado ? 'Sí, eliminar todo' : 'Sí, quitar',
          role: 'destructive',
          cssClass: 'danger',
          handler: () => {
            this.ejecutarQuitarAsignacion(evaluacionId, nombreEvaluador);
          }
        }
      ],
      cssClass: yaEvaluado ? 'alert-danger' : 'alert-warning'
    });

    await alert.present();
  }

  private ejecutarQuitarAsignacion(evaluacionId: number, nombreEvaluador: string): void {
    this.evaluacionService.eliminarEvaluacion(evaluacionId).subscribe({
      next: () => {
        this.showSuccess(`Asignación de "${nombreEvaluador}" eliminada correctamente`);
        this.cargarDatos();
      },
      error: (err: any) => {
        console.error('Error quitando asignación:', err);
        this.showError(err.error?.mensaje || 'Error al quitar la asignación');
      }
    });
  }

  // ============================================
  // ACCIONES ADMIN
  // ============================================
  editarEvaluacionAdmin(asignacion: any): void {
    const evaluacionId = asignacion.id || asignacion.evaluacion_id;
    if (!evaluacionId) {
      this.showError('No se encontró el ID de la evaluación');
      return;
    }
    this.router.navigate(['/admin/evaluaciones/formulario', evaluacionId]);
  }

  async reabrirEvaluacion(asignacion: any): Promise<void> {
    const evaluacionId = asignacion.id || asignacion.evaluacion_id;
    if (!evaluacionId) {
      this.showError('No se encontró el ID de la evaluación');
      return;
    }

    const nombreProyecto = asignacion.proyecto_nombre || asignacion.proyecto?.nombre || 'proyecto';

    const alert = await this.alertController.create({
      header: 'Reabrir evaluación',
      message: `¿Estás seguro de reabrir la evaluación del proyecto "<strong>${nombreProyecto}</strong>"?<br><br>El evaluador podrá modificarla nuevamente.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Reabrir',
          handler: () => {
            this.ejecutarReabrirEvaluacion(evaluacionId, nombreProyecto);
          }
        }
      ]
    });

    await alert.present();
  }

  private ejecutarReabrirEvaluacion(evaluacionId: number, nombreProyecto: string): void {
    this.evaluacionService.reabrirEvaluacion(evaluacionId).subscribe({
      next: () => {
        this.showSuccess(`Evaluación de "${nombreProyecto}" reabierta correctamente`);
        this.cargarDatos();
      },
      error: (err: any) => {
        console.error('Error reabriendo:', err);
        this.showError(err.error?.mensaje || 'Error al reabrir la evaluación');
      }
    });
  }

  async eliminarEvaluacion(asignacion: any): Promise<void> {
    const evaluacionId = asignacion.id || asignacion.evaluacion_id;
    if (!evaluacionId) {
      this.showError('No se encontró el ID de la evaluación');
      return;
    }

    const nombreProyecto = asignacion.proyecto_nombre || asignacion.proyecto?.nombre || 'proyecto';

    const alert = await this.alertController.create({
      header: 'Eliminar evaluación',
      message: `¿Estás seguro de eliminar la evaluación del proyecto "<strong>${nombreProyecto}</strong>"?<br><br>Esta acción <strong>no se puede deshacer</strong>.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          cssClass: 'danger',
          handler: () => {
            this.ejecutarEliminarEvaluacion(evaluacionId, nombreProyecto);
          }
        }
      ]
    });

    await alert.present();
  }

  private ejecutarEliminarEvaluacion(evaluacionId: number, nombreProyecto: string): void {
    this.evaluacionService.eliminarEvaluacion(evaluacionId).subscribe({
      next: () => {
        this.showSuccess(`Evaluación de "${nombreProyecto}" eliminada correctamente`);
        this.cargarDatos();
      },
      error: (err: any) => {
        console.error('Error eliminando:', err);
        this.showError(err.error?.mensaje || 'Error al eliminar la evaluación');
      }
    });
  }

  verDetalleAsignacion(asignacion: any): void {
    const evaluacionId = asignacion.id || asignacion.evaluacion_id;
    if (!evaluacionId) {
      this.showError('No se encontró el ID de la evaluación');
      return;
    }
    this.router.navigate(['/admin/evaluaciones', evaluacionId]);
  }

  // ============================================
  // UTILIDADES
  // ============================================
  resetForm(): void {
    this.proyectoId = null;
    this.evaluadorId = null;
    this.fechaLimite = null;
  }

  verTodasAsignaciones(): void {
    this.router.navigate(['/admin/asignaciones/todas']);
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'pending': 'time-outline',
      'pendiente': 'time-outline',
      'in-progress': 'refresh-outline',
      'en_progreso': 'refresh-outline',
      'completed': 'checkmark-circle-outline',
      'completado': 'checkmark-circle-outline',
      'rejected': 'close-circle-outline',
      'rechazado': 'close-circle-outline',
      'asignado': 'time-outline',
      'evaluado': 'checkmark-circle-outline'
    };
    return icons[status] || 'time-outline';
  }

  getStatusText(status: string): string {
    const texts: Record<string, string> = {
      'pending': 'Pendiente',
      'pendiente': 'Pendiente',
      'in-progress': 'En progreso',
      'en_progreso': 'En progreso',
      'completed': 'Completado',
      'completado': 'Completado',
      'rejected': 'Rechazado',
      'rechazado': 'Rechazado',
      'asignado': 'Asignado',
      'evaluado': 'Evaluado'
    };
    return texts[status] || 'Pendiente';
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'pending': 'status-pending',
      'pendiente': 'status-pending',
      'asignado': 'status-pending',
      'in-progress': 'status-progress',
      'en_progreso': 'status-progress',
      'completed': 'status-completed',
      'completado': 'status-completed',
      'evaluado': 'status-completed',
      'rejected': 'status-rejected',
      'rechazado': 'status-rejected'
    };
    return classes[status] || 'status-pending';
  }

  // ============================================
  // ALERTAS
  // ============================================
  private showSuccess(message: string): void {
    const alert = this.alertController.create({
      header: '✅ Éxito',
      message: message,
      buttons: ['OK'],
      cssClass: 'alert-success'
    });
    alert.then(a => a.present());
  }

  private showError(message: string): void {
    const alert = this.alertController.create({
      header: '❌ Error',
      message: message,
      buttons: ['OK'],
      cssClass: 'alert-error'
    });
    alert.then(a => a.present());
  }
}
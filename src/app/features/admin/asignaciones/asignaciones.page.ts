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
  IonSkeletonText
} from '@ionic/angular/standalone';
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
  closeOutline
} from 'ionicons/icons';

import { ProyectoService } from '../../../core/services/proyecto.service';
import { AsignacionService } from '../../../core/services/asignacion.service';
import { AuthService } from '../../../core/services/auth.service';

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
    IonSkeletonText
  ],
  templateUrl: './asignaciones.page.html',
  styleUrls: ['./asignaciones.page.scss']
})
export class AsignacionesPage implements OnInit {

  proyectos: any[] = [];
  evaluadores: any[] = [];
  asignacionesRecientes: any[] = [];
  asignacionesCount: number = 0;

  proyectoId: number | null = null;
  evaluadorId: number | null = null;
  fechaLimite: string | null = null;

  // Propiedad computada para el proyecto seleccionado
  get proyectoSeleccionado(): any {
    if (!this.proyectoId) return null;
    return this.proyectos.find(p => p.id === this.proyectoId) || null;
  }

  submitting: boolean = false;
  cargando: boolean = false;
  
  constructor(
    private proyectoService: ProyectoService,
    private asignacionService: AsignacionService,
    private authService: AuthService,
    private router: Router
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
      closeOutline
    });
  }

  ngOnInit(): void {
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

    // Timeout de seguridad
    clearTimeout(this._loadingSafety);
    this._loadingSafety = setTimeout(() => {
      if (this.cargando) {
        this.cargando = false;
        console.warn('⏱️ Carga forzada por timeout');
      }
    }, 8000);
  }

  cargarProyectos(): void {
    this.proyectoService.listar().subscribe({
      next: (res: any) => {
        this.proyectos = res?.data ?? res?.proyectos ?? res ?? [];
        console.log('📁 Proyectos cargados:', this.proyectos.length);
        this._proyectosListos = true;
        this.verificarCargaCompleta();
      },
      error: (err: any) => {
        console.error('❌ Error cargando proyectos:', err);
        this.proyectos = [];
        this._proyectosListos = true;
        this.verificarCargaCompleta();
      }
    });
  }

  cargarEvaluadores(): void {
    this.asignacionService.obtenerEvaluadores().subscribe({
      next: (res: any) => {
        this.evaluadores = res?.data ?? res?.usuarios ?? res ?? [];
        console.log('👤 Evaluadores cargados:', this.evaluadores.length);
        this._evaluadoresListos = true;
        this.verificarCargaCompleta();
      },
      error: (err: any) => {
        console.error('❌ Error cargando evaluadores:', err);
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
        this.asignacionesRecientes = Array.isArray(data) ? data.slice(0, 5) : [];
        this.asignacionesCount = Array.isArray(data) ? data.length : 0;
        console.log('📋 Asignaciones cargadas:', this.asignacionesCount);
        this._asignacionesListas = true;
        this.verificarCargaCompleta();
      },
      error: (err: any) => {
        console.error('❌ Error cargando asignaciones:', err);
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
      console.log('✅ Todos los datos cargados correctamente');
    }
  }

  // ============================================
  // MANEJO DE SELECCIÓN DE PROYECTO
  // ============================================
  onProyectoSeleccionado(event: any): void {
    console.log('📌 Proyecto seleccionado:', this.proyectoId);
    // Si cambia el proyecto, reseteamos el evaluador seleccionado
    this.evaluadorId = null;
    console.log('🔄 Evaluador reseteado');
  }

  // ============================================
  // GUARDAR ASIGNACIÓN
  // ============================================
  guardar(): void {
    // Validaciones
    if (!this.proyectoId) {
      this.showError('Por favor, selecciona un proyecto');
      return;
    }

    if (!this.evaluadorId) {
      this.showError('Por favor, selecciona un evaluador');
      return;
    }

    // Verificar que el proyecto tenga rúbrica
    const proyecto = this.proyectos.find(p => p.id === this.proyectoId);
    if (proyecto && !proyecto.rubrica_id && !proyecto.rubrica) {
      this.showError('El proyecto no tiene una rúbrica asociada. Por favor, crea una rúbrica primero.');
      return;
    }

    this.submitting = true;

    const payload = {
      proyecto_id: this.proyectoId,
      evaluador_id: this.evaluadorId,
      fecha_limite: this.fechaLimite || null
    };

    console.log('📤 Enviando payload de asignación:', payload);

    this.asignacionService.asignar(payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        console.log('✅ Asignación exitosa:', res);
        this.showSuccess('Proyecto asignado correctamente al evaluador');
        this.resetForm();
        // Recargar datos para actualizar lista
        setTimeout(() => this.cargarDatos(), 500);
      },
      error: (err: any) => {
        this.submitting = false;
        console.error('❌ Error asignando:', err);

        let mensaje = err.error?.mensaje || err.error?.error || 'Error al asignar el proyecto';
        
        // Mensajes más amigables
        if (mensaje.includes('rúbrica')) {
          mensaje = 'El proyecto no tiene una rúbrica asociada. Por favor, crea una rúbrica primero.';
        } else if (mensaje.includes('ya asignado')) {
          mensaje = 'Este proyecto ya fue asignado a un evaluador.';
        } else if (mensaje.includes('evaluador')) {
          mensaje = 'El evaluador seleccionado no está disponible.';
        }
        
        this.showError(mensaje);
      }
    });
  }

  // ============================================
  // RESET FORM
  // ============================================
  resetForm(): void {
    this.proyectoId = null;
    this.evaluadorId = null;
    this.fechaLimite = null;
    console.log('🔄 Formulario reseteado');
  }

  // ============================================
  // NAVEGACIÓN
  // ============================================
  openNewProject(): void {
    this.router.navigate(['/admin/proyectos/nuevo']);
  }

  verTodasAsignaciones(): void {
    this.router.navigate(['/admin/asignaciones/todas']);
  }

  // ============================================
  // UTILIDADES PARA ESTADOS
  // ============================================
  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'pending': 'time-outline',
      'pendiente': 'time-outline',
      'in-progress': 'refresh-outline',
      'en_progreso': 'refresh-outline',
      'completed': 'checkmark-circle-outline',
      'completado': 'checkmark-circle-outline',
      'rejected': 'close-circle-outline',
      'rechazado': 'close-circle-outline'
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
      'rechazado': 'Rechazado'
    };
    return texts[status] || 'Pendiente';
  }

  // ============================================
  // NOTIFICACIONES (reemplaza alert)
  // ============================================
  private showSuccess(message: string): void {
    // Usar toast o alert según prefieras
    console.log('✅', message);
    // Si quieres usar alert temporalmente:
    // alert('✅ ' + message);
    
    // Recomiendo implementar un toast service
    // this.toastService.presentSuccess(message);
  }

  private showError(message: string): void {
    console.error('❌', message);
    // alert('❌ ' + message);
    // this.toastService.presentError(message);
  }
}
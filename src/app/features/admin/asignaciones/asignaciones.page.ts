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
  closeOutline,
  trashOutline,
  createOutline
} from 'ionicons/icons';

import { ProyectoService } from '../../../core/services/proyecto.service';
import { AsignacionService } from '../../../core/services/asignacion.service';
import { EvaluacionService } from '../../../core/services/evaluacion.service';
import { AuthService } from '../../../core/services/auth.service';
import { UsuarioService } from '../../../core/services/usuario.service'; // ✅ Importar UsuarioService

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

  submitting: boolean = false;
  cargando: boolean = false;
  
  // Admin
  esAdmin: boolean = false;
  
  // Propiedad computada para el proyecto seleccionado
  get proyectoSeleccionado(): any {
    if (!this.proyectoId) return null;
    return this.proyectos.find(p => p.id === this.proyectoId) || null;
  }
  
  constructor(
    private proyectoService: ProyectoService,
    private asignacionService: AsignacionService,
    private evaluacionService: EvaluacionService,
    private authService: AuthService,
    private usuarioService: UsuarioService, // ✅ Inyectar UsuarioService
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
      closeOutline,
      trashOutline,
      createOutline
    });

    // Verificar si el usuario es admin
    this.esAdmin = this.authService.esAdmin();
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
    this.cargarEvaluadores(); // ✅ Usa el método corregido
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
    console.log('📁 Cargando proyectos...');
    this.proyectoService.listar().subscribe({
      next: (res: any) => {
        this.proyectos = res?.data ?? res?.proyectos ?? res ?? [];
        console.log(`📁 Proyectos cargados: ${this.proyectos.length}`);
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

  // ✅ CORREGIDO - Usa UsuarioService.getEvaluadores()
  cargarEvaluadores(): void {
    console.log('🔍 Cargando evaluadores desde /api/usuarios/evaluadores...');
    
    this.usuarioService.getEvaluadores().subscribe({
      next: (res: any) => {
        console.log('📥 Respuesta de evaluadores:', res);
        
        // El endpoint devuelve { ok: true, data: [...] }
        if (res && res.ok && res.data) {
          this.evaluadores = res.data;
          console.log(`✅ ${this.evaluadores.length} evaluadores cargados correctamente`);
          
          // Mostrar los primeros 3 para depuración
          if (this.evaluadores.length > 0) {
            console.log('📌 Primeros evaluadores:');
            this.evaluadores.slice(0, 3).forEach((e: any) => {
              console.log(`   ${e.nombre} (ID: ${e.id}) - Rol: ${e.rol}`);
            });
          } else {
            console.warn('⚠️ No hay evaluadores disponibles en el sistema');
          }
        } else {
          console.error('❌ Respuesta sin datos:', res);
          this.evaluadores = [];
        }
        
        this._evaluadoresListos = true;
        this.verificarCargaCompleta();
      },
      error: (err: any) => {
        console.error('❌ Error cargando evaluadores:', err);
        console.error('   Detalles:', err.message || err);
        this.evaluadores = [];
        this._evaluadoresListos = true;
        this.verificarCargaCompleta();
      }
    });
  }

  cargarAsignacionesRecientes(): void {
    console.log('📋 Cargando asignaciones recientes...');
    this.asignacionService.listar().subscribe({
      next: (res: any) => {
        const data = res?.data ?? res ?? [];
        this.asignacionesRecientes = Array.isArray(data) ? data.slice(0, 5) : [];
        this.asignacionesCount = Array.isArray(data) ? data.length : 0;
        console.log(`📋 Asignaciones cargadas: ${this.asignacionesCount}`);
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
    
    // Verificar que el proyecto existe
    if (this.proyectoId) {
      const proyecto = this.proyectos.find(p => p.id === this.proyectoId);
      if (proyecto) {
        console.log(`✅ Proyecto: ${proyecto.nombre} (ID: ${proyecto.id})`);
      } else {
        console.warn(`⚠️ Proyecto ID ${this.proyectoId} no encontrado en la lista`);
      }
    }
    
    // Resetear evaluador al cambiar de proyecto
    this.evaluadorId = null;
    console.log('🔄 Evaluador reseteado');
  }

  // ============================================
  // MANEJO DE SELECCIÓN DE EVALUADOR
  // ============================================
  onEvaluadorSeleccionado(event: any): void {
    console.log('👤 Evaluador seleccionado:', this.evaluadorId);
    
    // Verificar que el evaluador existe
    if (this.evaluadorId) {
      const evaluador = this.evaluadores.find(e => e.id === this.evaluadorId);
      if (evaluador) {
        console.log(`✅ Evaluador: ${evaluador.nombre} (ID: ${evaluador.id})`);
      } else {
        console.warn(`⚠️ Evaluador ID ${this.evaluadorId} no encontrado en la lista`);
      }
    }
  }

  // ============================================
  // GUARDAR ASIGNACIÓN - CORREGIDO
  // ============================================
  guardar(): void {
    console.log('========================================');
    console.log('📝 GUARDANDO ASIGNACIÓN');
    console.log('========================================');
    
    // 1. Validar proyecto
    if (!this.proyectoId) {
      console.error('❌ No hay proyecto seleccionado');
      this.showError('Por favor, selecciona un proyecto');
      return;
    }
    
    // 2. Validar evaluador
    if (!this.evaluadorId) {
      console.error('❌ No hay evaluador seleccionado');
      this.showError('Por favor, selecciona un evaluador');
      return;
    }
    
    // 3. Validar que el evaluador existe en la lista
    const evaluador = this.evaluadores.find(e => e.id === this.evaluadorId);
    if (!evaluador) {
      console.error(`❌ Evaluador ID ${this.evaluadorId} no encontrado en la lista`);
      console.log('📌 Evaluadores disponibles:', this.evaluadores.map(e => `${e.id}: ${e.nombre}`));
      this.showError('El evaluador seleccionado no es válido');
      return;
    }
    
    console.log(`✅ Evaluador válido: ${evaluador.nombre} (ID: ${evaluador.id})`);
    
    // 4. Validar que el proyecto existe
    const proyecto = this.proyectos.find(p => p.id === this.proyectoId);
    if (!proyecto) {
      console.error(`❌ Proyecto ID ${this.proyectoId} no encontrado`);
      this.showError('El proyecto seleccionado no es válido');
      return;
    }
    
    console.log(`✅ Proyecto válido: ${proyecto.nombre} (ID: ${proyecto.id})`);

    // 5. Verificar que el proyecto tenga rúbrica (solo advertencia, no bloquea)
    if (!proyecto.rubrica_id && !proyecto.rubrica) {
      console.warn('⚠️ El proyecto no tiene rúbrica asociada');
      // No bloqueamos, dejamos que el backend decida
    }

    this.submitting = true;

    const payload = {
      proyectoId: this.proyectoId,  // ← Cambiar a proyectoId (coincide con el backend)
      evaluadorId: this.evaluadorId // ← Cambiar a evaluadorId (coincide con el backend)
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
        console.error('   Status:', err.status);
        console.error('   Mensaje:', err.message);
        console.error('   Error completo:', err);

        let mensaje = err.error?.mensaje || err.error?.error || 'Error al asignar el proyecto';
        
        // Mensajes más amigables
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
  // ADMIN ACTIONS
  // ============================================

  /**
   * EDITAR EVALUACIÓN (ADMIN)
   * Redirige al formulario de evaluación para editar las respuestas
   */
  editarEvaluacionAdmin(asignacion: any): void {
    const evaluacionId = asignacion.id || asignacion.evaluacion_id;
    
    if (!evaluacionId) {
      this.showError('No se encontró el ID de la evaluación');
      return;
    }

    // Redirigir al formulario de evaluación para editar
    this.router.navigate(['/admin/evaluaciones/formulario', evaluacionId]);
  }

  /**
   * REABRIR EVALUACIÓN (ADMIN)
   */
  async reabrirEvaluacion(asignacion: any): Promise<void> {
    const evaluacionId = asignacion.id || asignacion.evaluacion_id;
    
    if (!evaluacionId) {
      this.showError('No se encontró el ID de la evaluación');
      return;
    }

    const nombreProyecto = asignacion.proyecto_nombre || asignacion.proyecto?.nombre || 'proyecto';

    if (!confirm(`¿Estás seguro de reabrir la evaluación del proyecto "${nombreProyecto}"? El evaluador podrá modificarla nuevamente.`)) {
      return;
    }

    try {
      const result = await this.evaluacionService.reabrirEvaluacion(evaluacionId).toPromise();
      console.log('✅ Evaluación reabierta:', result);
      this.showSuccess(`Evaluación de "${nombreProyecto}" reabierta correctamente`);
      this.cargarDatos();
    } catch (err: any) {
      console.error('❌ Error reabriendo:', err);
      this.showError(err.error?.mensaje || 'Error al reabrir la evaluación');
    }
  }

  /**
   * ELIMINAR EVALUACIÓN (ADMIN)
   */
  async eliminarEvaluacion(asignacion: any): Promise<void> {
    const evaluacionId = asignacion.id || asignacion.evaluacion_id;
    
    if (!evaluacionId) {
      this.showError('No se encontró el ID de la evaluación');
      return;
    }

    const nombreProyecto = asignacion.proyecto_nombre || asignacion.proyecto?.nombre || 'proyecto';

    if (!confirm(`¿Estás seguro de eliminar la evaluación del proyecto "${nombreProyecto}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const result = await this.evaluacionService.eliminarEvaluacion(evaluacionId).toPromise();
      console.log('✅ Evaluación eliminada:', result);
      this.showSuccess(`Evaluación de "${nombreProyecto}" eliminada correctamente`);
      this.cargarDatos();
    } catch (err: any) {
      console.error('❌ Error eliminando:', err);
      this.showError(err.error?.mensaje || 'Error al eliminar la evaluación');
    }
  }

  /**
   * VER DETALLE DE ASIGNACIÓN (ADMIN)
   */
  verDetalleAsignacion(asignacion: any): void {
    const evaluacionId = asignacion.id || asignacion.evaluacion_id;
    
    if (!evaluacionId) {
      this.showError('No se encontró el ID de la evaluación');
      return;
    }

    // Redirigir al detalle de la evaluación
    this.router.navigate(['/admin/evaluaciones', evaluacionId]);
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

  // ============================================
  // NOTIFICACIONES
  // ============================================
  private showSuccess(message: string): void {
    console.log('✅', message);
    // Reemplaza con tu sistema de notificaciones (Toast, Alert, etc.)
    alert('✅ ' + message);
  }

  private showError(message: string): void {
    console.error('❌', message);
    // Reemplaza con tu sistema de notificaciones (Toast, Alert, etc.)
    alert('❌ ' + message);
  }
}
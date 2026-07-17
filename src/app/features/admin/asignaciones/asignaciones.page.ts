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
  eyeOutline
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

  submitting: boolean = false;
  cargando: boolean = false;
  
  constructor(
    private proyectoService: ProyectoService,
    private asignacionService: AsignacionService,
    private authService: AuthService,
    private router: Router,
    
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
      eyeOutline
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this._proyectosListos = false;
    this._evaluadoresListos = false;
    this._asignacionesListas = false;

    this.cargarProyectos();
    this.cargarEvaluadores();
    this.cargarAsignacionesRecientes();

    // Red de seguridad única: si algo se cuelga, no dejar el loading para siempre
    clearTimeout(this._loadingSafety);
    this._loadingSafety = setTimeout(() => {
      this.cargando = false;
    }, 6000);
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
    this.asignacionService.obtenerEvaluadores().subscribe({
      next: (res: any) => {
        this.evaluadores = res?.data ?? res?.usuarios ?? res ?? [];
        console.log('Evaluadores cargados:', this.evaluadores.length);
        this.verificarCargaCompleta();
      },
      error: (err: any) => {
        console.error('Error cargando evaluadores:', err);
        this.evaluadores = [];
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
        this.verificarCargaCompleta();
      },
      error: (err: any) => {
        console.error('Error cargando asignaciones:', err);
        this.asignacionesRecientes = [];
        this.asignacionesCount = 0;
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

  guardar(): void {
    if (!this.proyectoId || !this.evaluadorId) {
      this.showError('Selecciona un proyecto y un evaluador');
      return;
    }

    this.submitting = true;

    const payload = {
      proyecto_id: this.proyectoId,
      evaluador_id: this.evaluadorId
    };

    console.log('📤 Enviando payload de asignación:', payload);

    this.asignacionService.asignar(payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        console.log('✅ Asignación exitosa:', res);
        this.showSuccess('Proyecto asignado correctamente');
        this.resetForm();
        this.cargarDatos();
      },
      error: (err: any) => {
        this.submitting = false;
        console.error('❌ Error asignando:', err);

        let mensaje = err.error?.mensaje || 'Error al asignar el proyecto';
        if (mensaje === 'El proyecto no tiene rúbrica') {
          mensaje = 'El proyecto no tiene una rúbrica asociada. Por favor, crea una rúbrica primero.';
        }
        this.showError(mensaje);
      }
    });
  }

  resetForm(): void {
    this.proyectoId = null;
    this.evaluadorId = null;
    this.fechaLimite = null;
  }

  openNewProject(): void {
    this.router.navigate(['/admin/proyectos/nuevo']);
  }

  verTodasAsignaciones(): void {
    this.router.navigate(['/admin/asignaciones/todas']);
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'pending': 'time-outline',
      'in-progress': 'refresh-outline',
      'completed': 'checkmark-circle-outline',
      'rejected': 'close-circle-outline',
      'pendiente': 'time-outline',
      'en_progreso': 'refresh-outline',
      'completado': 'checkmark-circle-outline',
      'rechazado': 'close-circle-outline'
    };
    return icons[status] || 'time-outline';
  }

  getStatusText(status: string): string {
    const texts: Record<string, string> = {
      'pending': 'Pendiente',
      'in-progress': 'En progreso',
      'completed': 'Completado',
      'rejected': 'Rechazado',
      'pendiente': 'Pendiente',
      'en_progreso': 'En progreso',
      'completado': 'Completado',
      'rechazado': 'Rechazado'
    };
    return texts[status] || 'Pendiente';
  }

  private showSuccess(message: string): void {
    alert('✅ ' + message);
  }

  private showError(message: string): void {
    alert('❌ ' + message);
  }
}
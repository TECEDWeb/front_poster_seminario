import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonChip,
  IonDatetime
} from '@ionic/angular/standalone';

import { ProyectoService } from '../../../core/services/proyecto.service';
import { EvaluadorService } from '../../../core/services/evaluador.service';
import { AsignacionService } from '../../../core/services/asignacion.service';
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
  personAddOutline
} from 'ionicons/icons';

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
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonChip,
    IonDatetime
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

  constructor(
    private proyectoService: ProyectoService,
    private evaluadorService: EvaluadorService,
    private asignacionService: AsignacionService
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
      personAddOutline
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargarProyectos();
    this.cargarEvaluadores();
    this.cargarAsignacionesRecientes();
  }

  cargarProyectos(): void {
    this.proyectoService.listar().subscribe({
      next: (res: any) => {
        this.proyectos = res?.data ?? res ?? [];
      },
      error: (err) => {
        console.error('Error cargando proyectos:', err);
        this.proyectos = [];
      }
    });
  }

  cargarEvaluadores(): void {
    this.evaluadorService.listar().subscribe({
      next: (res: any) => {
        this.evaluadores = res?.data ?? res ?? [];
      },
      error: (err) => {
        console.error('Error cargando evaluadores:', err);
        this.evaluadores = [];
      }
    });
  }

  cargarAsignacionesRecientes(): void {
    this.asignacionService.listarRecientes().subscribe({
      next: (res: any) => {
        const data = res?.data ?? res ?? [];
        this.asignacionesRecientes = data.slice(0, 5);
        this.asignacionesCount = data.length;
      },
      error: () => {
        // Si el endpoint no existe, usamos datos mock
        this.asignacionesRecientes = this.getMockAssignments();
        this.asignacionesCount = this.asignacionesRecientes.length;
      }
    });
  }

  getMockAssignments(): any[] {
    return [
      {
        id: 1,
        proyecto_nombre: 'Sistema de Gestión IoT',
        evaluador_nombre: 'María González',
        fecha_asignacion: new Date(Date.now() - 3600000 * 2),
        status: 'in-progress'
      },
      {
        id: 2,
        proyecto_nombre: 'App de Evaluación Docente',
        evaluador_nombre: 'Carlos Ruiz',
        fecha_asignacion: new Date(Date.now() - 3600000 * 5),
        status: 'pending'
      },
      {
        id: 3,
        proyecto_nombre: 'Plataforma de Cursos Online',
        evaluador_nombre: 'Ana Martínez',
        fecha_asignacion: new Date(Date.now() - 86400000),
        status: 'completed'
      }
    ];
  }

  guardar(): void {
    if (!this.proyectoId || !this.evaluadorId) {
      return;
    }

    this.submitting = true;

    const payload: any = {
      proyecto_id: this.proyectoId,
      evaluador_id: this.evaluadorId
    };

    if (this.fechaLimite) {
      payload.fecha_limite = this.fechaLimite;
    }

    this.asignacionService.asignar(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.showSuccess('Proyecto asignado correctamente');
        this.resetForm();
        this.cargarDatos();
      },
      error: (err) => {
        this.submitting = false;
        console.error('Error asignando:', err);
        this.showError(err.error?.mensaje || 'Error al asignar el proyecto');
      }
    });
  }

  resetForm(): void {
    this.proyectoId = null;
    this.evaluadorId = null;
    this.fechaLimite = null;
  }

  openNewProject(): void {
    // Navegar a creación de proyecto
    // this.router.navigate(['/admin/proyectos/nuevo']);
    alert('Abrir formulario de nuevo proyecto');
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'pending': 'time-outline',
      'in-progress': 'refresh-outline',
      'completed': 'checkmark-circle-outline',
      'rejected': 'close-circle-outline'
    };
    return icons[status] || 'time-outline';
  }

  getStatusText(status: string): string {
    const texts: Record<string, string> = {
      'pending': 'Pendiente',
      'in-progress': 'En progreso',
      'completed': 'Completado',
      'rejected': 'Rechazado'
    };
    return texts[status] || 'Pendiente';
  }

  // Toast/Alert helpers (implementa según tu preferencia)
  private showSuccess(message: string): void {
    // Usa ToastController o AlertController
    alert('✅ ' + message);
  }

  private showError(message: string): void {
    alert('❌ ' + message);
  }
}
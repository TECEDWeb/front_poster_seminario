// asignaciones.page.ts - Corregir el error de listar
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
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonChip,
  IonDatetime,
  IonLabel
} from '@ionic/angular/standalone';

import { ProyectoService } from '../../../core/services/proyecto.service';
import { EvaluadorService } from '../../../core/services/evaluador.service'; // Usar EvaluadorService
import { AsignacionService } from '../../../core/services/asignacion.service';

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
    IonLabel
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
    private evaluadorService: EvaluadorService, // Usar EvaluadorService
    private asignacionService: AsignacionService
  ) {}

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
      error: (err: any) => {
        console.error('Error cargando proyectos:', err);
        this.proyectos = [];
      }
    });
  }

  cargarEvaluadores(): void {
    // Usar el método listar del EvaluadorService
    this.evaluadorService.listar().subscribe({
      next: (res: any) => {
        this.evaluadores = res?.data ?? res ?? [];
      },
      error: (err: any) => {
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
        this.asignacionesRecientes = [];
        this.asignacionesCount = 0;
      }
    });
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
      error: (err: any) => {
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

  private showSuccess(message: string): void {
    alert('✅ ' + message);
  }

  private showError(message: string): void {
    alert('❌ ' + message);
  }

  // asignaciones.page.ts - Añadir estos métodos

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
}
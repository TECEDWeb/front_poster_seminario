import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonIcon
} from '@ionic/angular/standalone';

import { ProyectoService } from '../../../core/services/proyecto.service';
import { EvaluadorService } from '../../../core/services/evaluador.service';
import { AsignacionService } from '../../../core/services/asignacion.service';

@Component({
  selector: 'app-asignaciones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonIcon
  ],
  templateUrl: './asignaciones.page.html'
})
export class AsignacionesPage implements OnInit {

  proyectos: any[] = [];
  evaluadores: any[] = [];

  proyectoId: number | null = null;
  evaluadorId: number | null = null;

  constructor(
    private proyectoService: ProyectoService,
    private evaluadorService: EvaluadorService,
    private asignacionService: AsignacionService
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {

    // PROYECTOS
    this.proyectoService.listar().subscribe({
      next: (res: any) => {
        // soporta {ok,data} o array directo
        this.proyectos = res?.data ?? res ?? [];
      },
      error: (err) => {
        console.error('Error proyectos:', err);
        this.proyectos = [];
      }
    });

    // EVALUADORES
    this.evaluadorService.listar().subscribe({
      next: (res: any) => {
        this.evaluadores = res?.data ?? res ?? [];
      },
      error: (err) => {
        console.error('Error evaluadores:', err);
        this.evaluadores = [];
      }
    });
  }

  guardar(): void {

    if (!this.proyectoId || !this.evaluadorId) {
      alert('Seleccione proyecto y evaluador');
      return;
    }

    this.asignacionService.asignar({
      proyecto_id: this.proyectoId,
      evaluador_id: this.evaluadorId
    }).subscribe({
      next: () => {
        alert('Proyecto asignado correctamente');

        this.proyectoId = null;
        this.evaluadorId = null;

        this.cargar();
      },
      error: (err) => {
        console.error('Error asignando:', err);
        alert(err.error?.mensaje || 'Error al asignar');
      }
    });
  }
}
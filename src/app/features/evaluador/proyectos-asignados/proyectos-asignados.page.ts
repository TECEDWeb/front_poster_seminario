import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonIcon,
  IonButton
} from '@ionic/angular/standalone';

import { Router } from '@angular/router';

import { addIcons } from 'ionicons';
import {
  documentTextOutline,
  peopleOutline,
  clipboardOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';

import { ProyectoService } from '../../../core/services/proyecto.service';
import { Proyecto } from '../../../core/models/proyecto.model';

@Component({
  selector: 'app-proyectos-asignados',
  standalone: true,
  imports: [
    CommonModule,

    // Ionic Standalone
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonIcon,
    IonButton
  ],
  templateUrl: './proyectos-asignados.page.html',
  styleUrls: ['./proyectos-asignados.page.scss']
})
export class ProyectosAsignadosPage implements OnInit {

  proyectos: Proyecto[] = [];

  constructor(
    private proyectoService: ProyectoService,
    private router: Router
  ) {

    addIcons({
      documentTextOutline,
      peopleOutline,
      clipboardOutline,
      checkmarkCircleOutline
    });

  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {

    this.proyectoService.listar().subscribe({

      next: (res: Proyecto[]) => {

        this.proyectos = res;

      },

      error: (err) => {

        console.error('Error cargando proyectos:', err);
        this.proyectos = [];

      }

    });

  }

  evaluar(id: number): void {

    this.router.navigate([
      '/evaluador/formulario-evaluacion',
      id
    ]);

  }

}
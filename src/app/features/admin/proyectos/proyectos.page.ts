import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonFab,
  IonFabButton
} from '@ionic/angular/standalone';
import { ProyectoService } from '../../../core/services/proyecto.service';
import { Proyecto } from '../../../core/models/proyecto.model';

import { addIcons } from 'ionicons';
import {
  addOutline,
  documentTextOutline,
  createOutline,
  trashOutline,
  folderOpenOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    // Ionic Standalone
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonButton,
    IonIcon,
    IonContent,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonFab,
    IonFabButton
  ],
  templateUrl: './proyectos.page.html',
  styleUrls: ['./proyectos.page.scss']
})
export class ProyectosPage implements OnInit {
  proyectos: Proyecto[] = [];
  busqueda = '';

  constructor(
    private proyectoService: ProyectoService
  ) {

    addIcons({
      addOutline,
      documentTextOutline,
      createOutline,
      trashOutline,
      folderOpenOutline
    });

  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {

    this.proyectoService.listar().subscribe({
      next: (res: any) => {
        console.log('PROYECTOS:', res);
        this.proyectos = res.proyectos ?? res ?? [];
      },

      error: (err) => {
        console.error(err);
        this.proyectos = [];
      }
    });
  }
}
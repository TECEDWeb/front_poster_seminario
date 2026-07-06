import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonButton,
  IonIcon,
  IonContent,
  IonSkeletonText,
  IonFab,
  IonFabButton
} from '@ionic/angular/standalone';

import { ConcursoService } from '../../../core/services/concurso.service';
import { Concurso } from '../../../core/models/concurso.model';

import { addIcons } from 'ionicons';
import {
  addOutline,
  trophyOutline,
  calendarOutline,
  starOutline,
  createOutline,
  listOutline,
  trashOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-concursos',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonButton,
    IonIcon,
    IonContent,
    IonSkeletonText,
    IonFab,
    IonFabButton
  ],
  templateUrl: './concursos.page.html',
  styleUrls: ['./concursos.page.scss']
})
export class ConcursosPage implements OnInit {

  concursos: Concurso[] = [];
  cargando = false;

  constructor(private concursoService: ConcursoService) {

    addIcons({
      addOutline,
      trophyOutline,
      calendarOutline,
      starOutline,
      createOutline,
      listOutline,
      trashOutline
    });

  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {

    this.cargando = true;

    this.concursoService.listar().subscribe({

      next: (res: any) => {

        // 🔒 normalización segura
        const data = res?.data ?? res?.concursos ?? res ?? [];

        this.concursos = Array.isArray(data) ? data : [];

        this.cargando = false;

      },

      error: (err) => {

        console.error('❌ Error cargando concursos:', err);

        this.concursos = [];
        this.cargando = false;

      }

    });

  }
  trackById(index: number, item: any): number {
    return item?.id ?? index;
  }

}
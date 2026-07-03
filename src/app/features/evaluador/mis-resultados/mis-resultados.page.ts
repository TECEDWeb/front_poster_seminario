import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonSkeletonText,
  IonIcon,
  IonButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  personOutline,
  calendarOutline,
  barChartOutline,
  statsChartOutline
} from 'ionicons/icons';
import { EvaluacionService } from '../../../core/services/evaluacion.service';
import { ResumenEvaluacion } from '../../../core/models/evaluacion.model';

@Component({
  selector: 'app-mis-resultados',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonSkeletonText,
    IonIcon,
    IonButton
  ],
  templateUrl: './mis-resultados.page.html',
  styleUrls: ['./mis-resultados.page.scss']
})
export class MisResultadosPage implements OnInit {

  evaluaciones: ResumenEvaluacion[] = [];
  loading = false;

  constructor(
    private evaluacionService: EvaluacionService
  ) {

    addIcons({
      checkmarkCircleOutline,
      personOutline,
      calendarOutline,
      barChartOutline,
      statsChartOutline
    });

  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {

    this.loading = true;

    this.evaluacionService.listarResumen().subscribe({

      next: (res: ResumenEvaluacion[]) => {

        this.evaluaciones = res;
        this.loading = false;

      },

      error: (err) => {

        console.error('Error al cargar evaluaciones', err);
        this.loading = false;

      }

    });

  }

}
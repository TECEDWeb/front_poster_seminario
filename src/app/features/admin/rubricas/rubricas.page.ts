import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
   IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonButton,
    IonIcon,
    IonSkeletonText,  
    IonFab,
    IonFabButton
} from '@ionic/angular/standalone';
import { RubricaService } from '../../../core/services/rubrica.service';
import { RubricaConcurso } from '../../../core/models/rubrica.model';
import { addIcons } from 'ionicons';
import {
  addOutline,
  checkboxOutline,
  createOutline,
  trashOutline,
  eyeOutline,
  layersOutline,
  listOutline,
  checkmarkCircleOutline,
  downloadOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-rubricas',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonButton,
    IonIcon,
    IonSkeletonText,  // Añadir
    IonFab,
    IonFabButton
  ],
  templateUrl: './rubricas.page.html',
  styleUrls: ['./rubricas.page.scss']
})
export class RubricasPage implements OnInit {

  rubricas: RubricaConcurso[] = [];
  cargando: boolean = false;
  totalSecciones: number = 0;
  totalNiveles: number = 0;

  constructor(private rubricaService: RubricaService) {
    addIcons({
      addOutline,
      checkboxOutline,
      createOutline,
      trashOutline,
      eyeOutline,
      layersOutline,
      listOutline,
      checkmarkCircleOutline,
      downloadOutline
    });
  }

  ngOnInit(): void {
    this.cargarRubricas();
  }

  cargarRubricas(): void {
    this.cargando = true;

    this.rubricaService.listar().subscribe({
      next: (res) => {
        this.rubricas = res || [];
        this.calcularEstadisticas();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando rúbricas:', err);
        this.rubricas = [];
        this.cargando = false;
      }
    });
  }

  calcularEstadisticas(): void {
    this.totalSecciones = this.rubricas.reduce(
      (total, r) => total + (r.secciones?.length || 0), 0
    );
    this.totalNiveles = this.rubricas.reduce(
      (total, r) => total + (r.niveles?.length || 0), 0
    );
  }

  totalCriterios(rubrica: RubricaConcurso): number {
    let total = 0;
    if (rubrica.secciones) {
      rubrica.secciones.forEach(s => {
        total += (s.criterios?.length || 0);
      });
    }
    return total;
  }

  confirmarEliminar(rubrica: RubricaConcurso): void {
    if (confirm(`¿Estás seguro de eliminar la rúbrica del concurso #${rubrica.concursoId}?`)) {
      this.eliminarRubrica(rubrica.concursoId);
    }
  }

  eliminarRubrica(concursoId: number): void {
    this.rubricaService.eliminar(concursoId).subscribe({
      next: () => {
        this.cargarRubricas();
      },
      error: (err) => {
        console.error('Error eliminando rúbrica:', err);
        alert('Error al eliminar la rúbrica');
      }
    });
  }

  exportarRubrica(rubrica: RubricaConcurso): void {
    console.log('Exportando rúbrica:', rubrica);
    alert('Función de exportación en desarrollo');
  }

  trackById(index: number, item: RubricaConcurso): number {
    return item?.concursoId ?? index;
  }
}
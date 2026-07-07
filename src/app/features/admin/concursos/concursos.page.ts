import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
  IonFabButton,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonChip,
  IonLabel
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
  trashOutline,
  eyeOutline,
  peopleOutline,
  pricetagOutline,
  searchOutline,
  funnelOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-concursos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
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
    IonFabButton,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonChip,
    IonLabel
  ],
  templateUrl: './concursos.page.html',
  styleUrls: ['./concursos.page.scss']
})
export class ConcursosPage implements OnInit {

  concursos: Concurso[] = [];
  concursosFiltrados: Concurso[] = [];
  concursosActivos: number = 0;
  cargando = false;

  filtroTexto: string = '';
  filtroEstado: string = 'todos';

  constructor(private concursoService: ConcursoService) {
    addIcons({
      addOutline,
      trophyOutline,
      calendarOutline,
      starOutline,
      createOutline,
      listOutline,
      trashOutline,
      eyeOutline,
      peopleOutline,
      pricetagOutline,
      searchOutline,
      funnelOutline
    });
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;

    this.concursoService.listar().subscribe({
      next: (res: any) => {
        const data = res?.data ?? res?.concursos ?? res ?? [];
        this.concursos = Array.isArray(data) ? data : [];
        this.concursosActivos = this.concursos.filter(c => c.activo).length;
        this.filtrarConcursos();
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error cargando concursos:', err);
        this.concursos = [];
        this.concursosFiltrados = [];
        this.cargando = false;
      }
    });
  }

  filtrarConcursos(): void {
    let filtered = [...this.concursos];

    if (this.filtroTexto.trim()) {
      const texto = this.filtroTexto.toLowerCase().trim();
      filtered = filtered.filter(c =>
        c.nombre?.toLowerCase().includes(texto) ||
        c.descripcion?.toLowerCase().includes(texto) ||
        c.tipo?.toLowerCase().includes(texto) ||
        c.categoria?.toLowerCase().includes(texto)
      );
    }

    if (this.filtroEstado === 'activo') {
      filtered = filtered.filter(c => c.activo);
    } else if (this.filtroEstado === 'inactivo') {
      filtered = filtered.filter(c => !c.activo);
    } else if (this.filtroEstado === 'finalizado') {
      filtered = filtered.filter(c => {
        if (!c.fechaFin) return false;
        return new Date(c.fechaFin) < new Date();
      });
    }

    this.concursosFiltrados = filtered;
  }

  calcularDiasRestantes(fechaFin: string): number {
    const fin = new Date(fechaFin);
    const hoy = new Date();
    const diff = Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }

  confirmarEliminar(concurso: Concurso): void {
    if (confirm(`¿Estás seguro de eliminar el concurso "${concurso.nombre}"?`)) {
      this.eliminarConcurso(concurso.id!);
    }
  }

  eliminarConcurso(id: number): void {
    this.concursoService.eliminar(id).subscribe({
      next: () => {
        this.cargar();
      },
      error: (err) => {
        console.error('Error eliminando concurso:', err);
        alert('Error al eliminar el concurso');
      }
    });
  }

  trackById(index: number, item: any): number {
    return item?.id ?? index;
  }
}
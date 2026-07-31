import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonSkeletonText,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  folderOutline,
  peopleOutline,
  searchOutline,
  refreshOutline,
  eyeOutline,
  schoolOutline,
  trophyOutline,
  starOutline,
  calendarOutline
} from 'ionicons/icons';
import { ProyectoService } from '../../../core/services/proyecto.service';
import { ConcursoService } from '../../../core/services/concurso.service';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonSkeletonText,
    IonButton,
    IonIcon
  ],
  templateUrl: './proyectos.page.html',
  styleUrls: ['./proyectos.page.scss']
})
export class ProyectosPage implements OnInit {

  proyectos: any[] = [];
  proyectosFiltrados: any[] = [];
  concursoAsignado: any = null;
  cargando: boolean = true;
  filtroBusqueda: string = '';

  constructor(
    private proyectoService: ProyectoService,
    private concursoService: ConcursoService
  ) {
    addIcons({
      folderOutline,
      peopleOutline,
      searchOutline,
      refreshOutline,
      eyeOutline,
      schoolOutline,
      trophyOutline,
      starOutline,
      calendarOutline
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;

    this.concursoService.listarActivos().subscribe({
      next: (concursos) => {
        if (concursos && concursos.length > 0) {
          this.concursoAsignado = concursos[0];
          this.cargarProyectos(this.concursoAsignado.id);
        } else {
          this.cargando = false;
        }
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  cargarProyectos(concursoId: number): void {
    this.proyectoService.listar().subscribe({
      next: (res: any) => {
        const data = res?.data ?? res ?? [];
        const todos = Array.isArray(data) ? data : [];
        
        this.proyectos = todos.filter(p => 
          Number(p.concursoId ?? p.concurso_id) === Number(concursoId)
        );
        
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: () => {
        this.proyectos = [];
        this.proyectosFiltrados = [];
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    let filtered = [...this.proyectos];

    if (this.filtroBusqueda.trim()) {
      const texto = this.filtroBusqueda.toLowerCase().trim();
      filtered = filtered.filter(p =>
        (p.nombre || '').toLowerCase().includes(texto) ||
        (p.area || '').toLowerCase().includes(texto) ||
        (p.nivel || '').toLowerCase().includes(texto)
      );
    }

    this.proyectosFiltrados = filtered;
  }

  recargar(): void {
    this.cargarDatos();
  }

  trackById(index: number, item: any): number {
    return item?.id ?? index;
  }
}
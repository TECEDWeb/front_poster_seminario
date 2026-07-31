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
  IonSearchbar,
  IonSkeletonText,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  peopleOutline,
  searchOutline,
  refreshOutline,
  checkmarkCircleOutline,
  timeOutline
} from 'ionicons/icons';
import { UsuarioService } from '../../../core/services/usuario.service';
import { AsignacionService } from '../../../core/services/asignacion.service';
import { ConcursoService } from '../../../core/services/concurso.service';

@Component({
  selector: 'app-evaluadores',
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
    IonSearchbar,
    IonSkeletonText,
    IonButton,
    IonIcon
  ],
  templateUrl: './evaluadores.page.html',
  styleUrls: ['./evaluadores.page.scss']
})
export class EvaluadoresPage implements OnInit {

  evaluadores: any[] = [];
  evaluadoresFiltrados: any[] = [];
  concursoAsignado: any = null;
  cargando: boolean = true;
  filtroBusqueda: string = '';

  constructor(
    private usuarioService: UsuarioService,
    private asignacionService: AsignacionService,
    private concursoService: ConcursoService
  ) {
    addIcons({
      peopleOutline,
      searchOutline,
      refreshOutline,
      checkmarkCircleOutline,
      timeOutline
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
          this.cargarEvaluadores(this.concursoAsignado.id);
        } else {
          this.cargando = false;
        }
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  cargarEvaluadores(concursoId: number): void {
    this.usuarioService.getEvaluadores().subscribe({
      next: (res: any) => {
        const data = res?.data ?? res ?? [];
        this.evaluadores = Array.isArray(data) ? data : [];
        
        this.asignacionService.listarPorConcurso(concursoId).subscribe({
          next: (asignaciones: any) => {
            const asigns = asignaciones?.data ?? asignaciones ?? [];
            
            this.evaluadores = this.evaluadores.map(e => {
              const asignacion = asigns.find((a: any) => 
                Number(a.evaluador_id ?? a.evaluadorId) === Number(e.id)
              );
              return {
                ...e,
                estado: asignacion?.estado || 'sin-asignar',
                proyectosAsignados: asignacion?.proyectos || 0
              };
            });
            
            this.aplicarFiltros();
            this.cargando = false;
          },
          error: () => {
            this.aplicarFiltros();
            this.cargando = false;
          }
        });
      },
      error: () => {
        this.evaluadores = [];
        this.evaluadoresFiltrados = [];
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    let filtered = [...this.evaluadores];

    if (this.filtroBusqueda.trim()) {
      const texto = this.filtroBusqueda.toLowerCase().trim();
      filtered = filtered.filter(e =>
        (e.nombre || '').toLowerCase().includes(texto) ||
        (e.especialidad || e.rol || '').toLowerCase().includes(texto)
      );
    }

    this.evaluadoresFiltrados = filtered;
  }

  getEstadoText(estado: string): string {
    const map: Record<string, string> = {
      'asignado': 'Asignado',
      'evaluado': 'Evaluado',
      'pendiente': 'Pendiente',
      'sin-asignar': 'Sin asignar'
    };
    return map[estado] || estado;
  }

  getEstadoClass(estado: string): string {
    const map: Record<string, string> = {
      'asignado': 'estado-asignado',
      'evaluado': 'estado-evaluado',
      'pendiente': 'estado-pendiente',
      'sin-asignar': 'estado-sin-asignar'
    };
    return map[estado] || 'estado-sin-asignar';
  }

  recargar(): void {
    this.cargarDatos();
  }

  trackById(index: number, item: any): number {
    return item?.id ?? index;
  }
}
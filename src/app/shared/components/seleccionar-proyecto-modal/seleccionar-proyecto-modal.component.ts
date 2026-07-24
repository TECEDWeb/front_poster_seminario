import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonBadge,
  IonSkeletonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  searchOutline,
  trophyOutline,
  folderOpenOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  bugOutline
} from 'ionicons/icons';

import { ProyectoService } from '../../../core/services/proyecto.service';
import { ConcursoService } from '../../../core/services/concurso.service';

@Component({
  selector: 'app-seleccionar-proyecto-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonBadge,
    IonSkeletonText
  ],
  templateUrl: './seleccionar-proyecto-modal.component.html',
  styleUrls: ['./seleccionar-proyecto-modal.component.scss']
})
export class SeleccionarProyectoModalComponent implements OnInit {

  @Input() isOpen = false;
  @Input() proyectoSeleccionadoId: number | null = null;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() proyectoSeleccionado = new EventEmitter<number>();

  proyectos: any[] = [];
  proyectosFiltrados: any[] = [];
  concursos: any[] = [];

  cargando = false;
  filtroBusqueda = '';
  filtroConcursoId: number | null = null;

  constructor(
    private proyectoService: ProyectoService,
    private concursoService: ConcursoService
  ) {
    addIcons({
      closeOutline,
      searchOutline,
      trophyOutline,
      folderOpenOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      bugOutline
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.cargarConcursos();
    this.cargarProyectos();
  }

  cargarConcursos(): void {
    this.concursoService.listar().subscribe({
      next: (res: any) => {
        if (res && res.ok && res.data) {
          this.concursos = res.data;
        } else if (Array.isArray(res)) {
          this.concursos = res;
        } else if (res && res.concursos) {
          this.concursos = res.concursos;
        } else {
          this.concursos = res ?? [];
        }
        console.log('📊 CONCURSOS CARGADOS:', this.concursos);
      },
      error: (err) => {
        console.error('❌ Error cargando concursos:', err);
        this.concursos = [];
      }
    });
  }

  cargarProyectos(): void {
    this.proyectoService.listar().subscribe({
      next: (res: any) => {
        if (res && res.ok && res.data) {
          this.proyectos = res.data.map((p: any) => ({
            ...p,
            concursoId: p.concursoId ?? p.concurso_id ?? null,
            concurso_id: p.concursoId ?? p.concurso_id ?? null
          }));
        } else if (Array.isArray(res)) {
          this.proyectos = res.map((p: any) => ({
            ...p,
            concursoId: p.concursoId ?? p.concurso_id ?? null,
            concurso_id: p.concursoId ?? p.concurso_id ?? null
          }));
        } else {
          this.proyectos = res ?? [];
        }
        
        console.log('📊 PROYECTOS CARGADOS (normalizados):', this.proyectos);
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error cargando proyectos:', err);
        this.proyectos = [];
        this.proyectosFiltrados = [];
        this.cargando = false;
      }
    });
  }

  getNombreConcurso(concursoId: number): string {
    if (!concursoId) return 'Sin concurso';
    const concurso = this.concursos.find(c => Number(c.id) === Number(concursoId));
    return concurso?.nombre || `Concurso #${concursoId}`;
  }

  aplicarFiltros(): void {
    let filtrados = [...this.proyectos];

    console.log('🔍 Aplicando filtros...');
    console.log('🔍 filtroConcursoId:', this.filtroConcursoId);

    if (this.filtroConcursoId !== null && this.filtroConcursoId !== undefined) {
      const idNum = Number(this.filtroConcursoId);
      filtrados = filtrados.filter(p => {
        const concursoId = p.concursoId ?? p.concurso_id;
        const coincide = Number(concursoId) === idNum;
        return coincide;
      });
      console.log(`🔍 Proyectos con concurso ${idNum}:`, filtrados.length);
    }

    if (this.filtroBusqueda.trim()) {
      const busqueda = this.filtroBusqueda.toLowerCase().trim();
      filtrados = filtrados.filter(p => {
        const nombre = (p.nombre || '').toLowerCase();
        const area = (p.area || '').toLowerCase();
        const nivel = (p.nivel || '').toLowerCase();
        return nombre.includes(busqueda) || area.includes(busqueda) || nivel.includes(busqueda);
      });
      console.log('🔍 Después de búsqueda:', filtrados.length);
    }

    this.proyectosFiltrados = filtrados;
    console.log('🔍 Proyectos filtrados finales:', this.proyectosFiltrados.length);
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroConcursoId = null;
    this.aplicarFiltros();
  }

  seleccionarProyecto(proyectoId: number): void {
    this.proyectoSeleccionado.emit(proyectoId);
    this.cerrarModal();
  }

  cerrarModal(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }

  debugInfo(): void {
    console.log('========================================');
    console.log('🔍 DEPURACIÓN DEL MODAL DE PROYECTOS');
    console.log('========================================');
    console.log('📊 CONCURSOS:', this.concursos);
    console.log('📊 PROYECTOS (primeros 5):', this.proyectos.slice(0, 5));
    console.log('📊 FILTRO CONCURSO:', this.filtroConcursoId);
    console.log('📊 FILTRO BUSQUEDA:', this.filtroBusqueda);
    console.log('📊 PROYECTOS FILTRADOS:', this.proyectosFiltrados);
    console.log('========================================');
  }
}
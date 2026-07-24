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
  IonItem,
  IonBadge,
  IonSkeletonText,
  IonAvatar,
  IonChip
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  searchOutline,
  trophyOutline,
  folderOpenOutline,
  checkmarkCircleOutline,
  alertCircleOutline
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
    IonItem,
    IonBadge,
    IonSkeletonText,
    IonAvatar,
    IonChip
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

  // ✅ Para depuración
  debugInfo: string = '';

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
      alertCircleOutline
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.debugInfo = 'Cargando...';
    this.cargarConcursos();
    this.cargarProyectos();
  }

  cargarConcursos(): void {
    this.concursoService.listar().subscribe({
      next: (res: any) => {
        // ✅ Asegurar que obtenemos los datos correctamente
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
        this.debugInfo = `Concursos: ${this.concursos.length}`;
        
        // ✅ Si hay proyectos, aplicar filtros nuevamente
        if (this.proyectos.length > 0) {
          this.aplicarFiltros();
        }
      },
      error: (err) => {
        console.error('❌ Error cargando concursos:', err);
        this.concursos = [];
        this.debugInfo = 'Error cargando concursos';
      }
    });
  }

  cargarProyectos(): void {
    this.proyectoService.listar().subscribe({
      next: (res: any) => {
        // ✅ Asegurar que obtenemos los datos correctamente
        if (res && res.ok && res.data) {
          this.proyectos = res.data;
        } else if (Array.isArray(res)) {
          this.proyectos = res;
        } else if (res && res.proyectos) {
          this.proyectos = res.proyectos;
        } else {
          this.proyectos = res ?? [];
        }
        
        console.log('📊 PROYECTOS CARGADOS:', this.proyectos);
        console.log('📊 Primer proyecto:', this.proyectos[0]);
        console.log('📊 concurso_id del primer proyecto:', this.proyectos[0]?.concurso_id);
        
        this.debugInfo = `Proyectos: ${this.proyectos.length}`;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error cargando proyectos:', err);
        this.proyectos = [];
        this.proyectosFiltrados = [];
        this.cargando = false;
        this.debugInfo = 'Error cargando proyectos';
      }
    });
  }

  // ✅ MÉTODO PARA OBTENER NOMBRE DE CONCURSO (más robusto)
  getNombreConcurso(concursoId: number): string {
    if (!concursoId) return 'Sin concurso';
    const concurso = this.concursos.find(c => Number(c.id) === Number(concursoId));
    return concurso?.nombre || `Concurso #${concursoId}`;
  }

  aplicarFiltros(): void {
    let filtrados = [...this.proyectos];

    console.log('🔍 Aplicando filtros...');
    console.log('🔍 filtroConcursoId:', this.filtroConcursoId);
    console.log('🔍 filtroBusqueda:', this.filtroBusqueda);

    // ✅ FILTRO POR CONCURSO - Comparación segura
    if (this.filtroConcursoId) {
      const idNum = Number(this.filtroConcursoId);
      filtrados = filtrados.filter(p => {
        const concursoId = Number(p.concurso_id);
        return concursoId === idNum;
      });
      console.log(`🔍 Proyectos con concurso ${idNum}:`, filtrados.length);
    }

    // ✅ FILTRO POR BÚSQUEDA
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

  // ✅ DEPURACIÓN - Muestra info en la consola
  debugInfoConsola(): void {
    console.log('========================================');
    console.log('🔍 DEPURACIÓN DEL MODAL DE PROYECTOS');
    console.log('========================================');
    console.log('📊 CONCURSOS:', this.concursos);
    console.log('📊 PROYECTOS:', this.proyectos);
    console.log('📊 FILTRO CONCURSO:', this.filtroConcursoId);
    console.log('📊 FILTRO BUSQUEDA:', this.filtroBusqueda);
    console.log('📊 PROYECTOS FILTRADOS:', this.proyectosFiltrados);
    console.log('========================================');
  }
}
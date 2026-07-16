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
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonFab,
  IonFabButton,
  IonChip,
  IonLabel,
  IonSkeletonText,
  IonModal,
  IonItem,
  IonInput,
  IonTextarea,
  IonToggle
} from '@ionic/angular/standalone';
import { ProyectoService } from '../../../core/services/proyecto.service';
import { Proyecto, Participante } from '../../../core/models/proyecto.model';
import { ConcursoService } from '../../../core/services/concurso.service';
import { ReporteService } from '../../../core/services/reporte.service';
import { addIcons } from 'ionicons';
import {
  addOutline,
  documentTextOutline,
  createOutline,
  trashOutline,
  folderOpenOutline,
  eyeOutline,
  peopleOutline,
  businessOutline,
  barChartOutline,
  searchOutline,
  trophyOutline,
  closeOutline,
  checkmarkOutline,
  refreshOutline,
  pricetagOutline,
  calendarOutline,
  starOutline,
  folderOutline,
  personOutline,
  toggleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-proyectos',
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
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonFab,
    IonFabButton,
    IonChip,
    IonLabel,
    IonSkeletonText,
    IonModal,
    IonItem,
    IonInput,
    IonTextarea,
    IonToggle
  ],
  templateUrl: './proyectos.page.html',
  styleUrls: ['./proyectos.page.scss']
})
export class ProyectosPage implements OnInit {

  proyectos: Proyecto[] = [];
  proyectosFiltrados: Proyecto[] = [];
  proyectosActivos: number = 0;
  totalParticipantes: number = 0;
  cargando: boolean = false;
  cargandoConcursos: boolean = false;

  busqueda: string = '';
  filtroNivel: string = 'todos';
  filtroEstado: string = 'todos';

  modalAbierto = false;
  editando = false;
  guardando = false;
  concursosDisponibles: any[] = [];

  form: any = {
    id: null,
    nombre: '',
    descripcion: '',
    concursoId: null,
    estudianteNombre: '',
    nivel: '',
    area: '',
    activo: true,
    participantes: []
  };

  modalDetalleAbierto = false;
  cargandoDetalle = false;
  errorDetalle: string | null = null;
  proyectoSeleccionado: Proyecto | null = null;
  detalleEvaluaciones: any = null;

  constructor(
    private proyectoService: ProyectoService,
    private concursoService: ConcursoService,
    private reporteService: ReporteService
  ) {
    addIcons({
      refreshOutline, addOutline, searchOutline, documentTextOutline,
      businessOutline, barChartOutline, peopleOutline, trophyOutline,
      eyeOutline, createOutline, trashOutline, folderOpenOutline,
      closeOutline, pricetagOutline, personOutline, toggleOutline,
      checkmarkOutline, calendarOutline, starOutline, folderOutline
    });
  }

  ngOnInit(): void {
    this.cargar();
    this.cargarConcursos();
  }

  cargar(): void {
    this.cargando = true;

    this.proyectoService.listar().subscribe({
      next: (res: any) => {
        this.proyectos = res?.data ?? res?.proyectos ?? res ?? [];
        this.calcularEstadisticas();
        this.filtrarProyectos();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando proyectos:', err);
        this.proyectos = [];
        this.proyectosFiltrados = [];
        this.cargando = false;
      }
    });
  }

  cargarConcursos(): void {
    this.cargandoConcursos = true;
    this.concursoService.listar().subscribe({
      next: (res: any) => {
        this.concursosDisponibles = res?.data ?? res ?? [];
        this.cargandoConcursos = false;
      },
      error: (err) => {
        console.error('Error cargando concursos:', err);
        this.concursosDisponibles = [];
        this.cargandoConcursos = false;
      }
    });
  }

  calcularEstadisticas(): void {
    this.proyectosActivos = this.proyectos.filter(p => p.activo).length;
    this.totalParticipantes = this.proyectos.reduce(
      (total, p) => total + (p.participantes?.length || 0),
      0
    );
  }

  filtrarProyectos(): void {
    let filtered = [...this.proyectos];

    if (this.busqueda.trim()) {
      const texto = this.busqueda.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.nombre?.toLowerCase().includes(texto) ||
        p.area?.toLowerCase().includes(texto) ||
        p.nivel?.toLowerCase().includes(texto) ||
        p.descripcion?.toLowerCase().includes(texto)
      );
    }

    if (this.filtroNivel !== 'todos') {
      filtered = filtered.filter(p => p.nivel === this.filtroNivel);
    }

    if (this.filtroEstado === 'activo') {
      filtered = filtered.filter(p => p.activo);
    } else if (this.filtroEstado === 'inactivo') {
      filtered = filtered.filter(p => !p.activo);
    }

    this.proyectosFiltrados = filtered;
  }

  abrirCrear(): void {
    this.editando = false;
    this.form = {
      id: null,
      nombre: '',
      descripcion: '',
      concursoId: null,
      estudianteNombre: '',
      nivel: '',
      area: '',
      activo: true,
      participantes: []
    };
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

 editar(proyecto: Proyecto): void {
    this.editando = true;

    this.form = {
      id: proyecto.id,
      nombre: proyecto.nombre || '',
      descripcion: proyecto.descripcion || '',
      concursoId: proyecto.concursoId != null ? Number(proyecto.concursoId) : null,
      estudianteNombre: proyecto.estudianteNombre || '',
      nivel: proyecto.nivel || '',
      area: proyecto.area || '',
      activo: proyecto.activo ?? true,
      participantes: proyecto.participantes || []
    };

    this.modalAbierto = true;
  }
  /** Evita que el ion-select falle por comparar tipos distintos (string vs number) */
  compararConcurso = (c1: any, c2: any): boolean => {
    return c1 != null && c2 != null ? Number(c1) === Number(c2) : c1 === c2;
  };

  guardar(): void {
    if (!this.form.nombre || this.form.nombre.trim() === '') {
      alert('Por favor ingrese el nombre del proyecto');
      return;
    }

    if (!this.form.estudianteNombre || this.form.estudianteNombre.trim() === '') {
      alert('Por favor ingrese el nombre del estudiante');
      return;
    }

    this.guardando = true;

    const payload = {
      nombre: this.form.nombre.trim(),
      descripcion: this.form.descripcion || null,
      concursoId: this.form.concursoId || null,
      estudiante_nombre: this.form.estudianteNombre.trim(),
      nivel: this.form.nivel || null,
      area: this.form.area || null,
      activo: this.form.activo ?? true
    };

    const req = this.editando
      ? this.proyectoService.actualizar(this.form.id, payload)
      : this.proyectoService.crear(payload);

    req.subscribe({
      next: () => {
        this.guardando = false;
        this.modalAbierto = false;
        this.cargar();
        alert(this.editando ? 'Proyecto actualizado correctamente' : 'Proyecto creado correctamente');
      },
      error: (err) => {
        this.guardando = false;
        console.error('Error guardando proyecto:', err);
        alert(err.error?.mensaje || 'Error al guardar el proyecto');
      }
    });
  }

  verDetalle(proyecto: Proyecto): void {
    this.proyectoSeleccionado = proyecto;
    this.modalDetalleAbierto = true;
    this.cargandoDetalle = true;
    this.errorDetalle = null;
    this.detalleEvaluaciones = null;

    this.reporteService.getDetalleProyecto(proyecto.id).subscribe({
      next: (res: any) => {
        const data = res?.data ?? res;
        this.detalleEvaluaciones = {
          evaluaciones: data.evaluaciones || [],
          evaluadores: data.evaluadores || [],
          promedio: data.promedio || 0,
          totalEvaluaciones: data.totalEvaluaciones || 0
        };
        this.cargandoDetalle = false;
      },
      error: (err) => {
        console.error('Error cargando detalle de evaluaciones:', err);
        this.errorDetalle = 'No se pudieron cargar las evaluaciones de este proyecto';
        this.detalleEvaluaciones = { evaluaciones: [], evaluadores: [], promedio: 0, totalEvaluaciones: 0 };
        this.cargandoDetalle = false;
      }
    });
  }

  cerrarModalDetalle(): void {
    this.modalDetalleAbierto = false;
    this.proyectoSeleccionado = null;
    this.detalleEvaluaciones = null;
    this.errorDetalle = null;
  }

  /** Desde el modal de solo lectura, saltar directo a editar */
  editarDesdeDetalle(): void {
    if (!this.proyectoSeleccionado) return;
    const proyecto = this.proyectoSeleccionado;
    this.cerrarModalDetalle();
    this.editar(proyecto);
  }

  getEstadoEvaluacion(estado: string): string {
    return estado === 'evaluado' ? 'status-excellent' : 'status-regular';
  }

  confirmarEliminar(proyecto: Proyecto): void {
    if (confirm(`¿Estás seguro de eliminar el proyecto "${proyecto.nombre}"? Esta acción no se puede deshacer.`)) {
      this.eliminarProyecto(proyecto.id);
    }
  }

  eliminarProyecto(id: number): void {
    this.proyectoService.eliminar(id).subscribe({
      next: () => {
        this.cargar();
        alert('Proyecto eliminado correctamente');
      },
      error: (err) => {
        console.error('Error eliminando proyecto:', err);
        alert(err.error?.mensaje || 'Error al eliminar el proyecto');
      }
    });
  }

  recargar(): void {
    this.cargar();
  }

  nombreConcurso(proyecto: Proyecto): string {
    return proyecto.concursoNombre || (proyecto.concursoId ? `Concurso #${proyecto.concursoId}` : '');
  }

  trackById(index: number, item: any): number {
    return item?.id ?? index;
  }
}
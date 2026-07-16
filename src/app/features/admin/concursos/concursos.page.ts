import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
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
  IonLabel,
  IonModal,
  IonInput,
  IonTextarea,
  IonDatetime,
  IonToggle,
  IonItem
} from '@ionic/angular/standalone';
import { ConcursoService } from '../../../core/services/concurso.service';
import { Concurso } from '../../../core/models/concurso.model';
import { ProyectoService } from '../../../core/services/proyecto.service';
import { RubricaService } from '../../../core/services/rubrica.service';
import { getEstadoConcurso, getEstadoColor } from '../../../core/models/concurso.model';
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
  funnelOutline,
  closeOutline,
  checkmarkOutline,
  refreshOutline,
  documentTextOutline,
  folderOutline,
  toggleOutline
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
    IonLabel,
    IonModal,
    IonInput,
    IonTextarea,
    IonDatetime,
    IonToggle,
    IonItem
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

  modalAbierto = false;
  editando = false;
  guardando = false;

  form: any = {
    id: null,
    nombre: '',
    descripcion: '',
    tipo: '',
    fechaInicio: '',
    fechaFin: '',
    puntajeMaximo: null,
    activo: true
  };
  // Modal "Ver detalle" (solo lectura)
  modalDetalleAbierto = false;
  cargandoDetalle = false;
  concursoSeleccionado: Concurso | null = null;
  proyectosDelConcurso: any[] = [];
  rubricaDelConcurso: any = null;
  tieneRubricaConfigurada = false;

  constructor(
    private concursoService: ConcursoService,
    private proyectoService: ProyectoService,
    private rubricaService: RubricaService,
    private route: ActivatedRoute,
    private router: Router

  ) {
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
      funnelOutline,
      closeOutline,
      checkmarkOutline,
      refreshOutline,
      documentTextOutline,
      folderOutline,
      toggleOutline
    });
  }

  ngOnInit(): void {
    this.cargar();

    this.route.queryParams.subscribe(params => {
      if (params['openModal'] === 'true') {
        if (!this.cargando) {
          setTimeout(() => {
            this.abrirCrear();
          }, 300);
        } else {
          const checkLoading = setInterval(() => {
            if (!this.cargando) {
              clearInterval(checkLoading);
              setTimeout(() => {
                this.abrirCrear();
              }, 300);
            }
          }, 200);
        }
      }
    });
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

  abrirCrear(): void {
    this.editando = false;
    this.form = {
      id: null,
      nombre: '',
      descripcion: '',
      tipo: '',
      fechaInicio: '',
      fechaFin: '',
      puntajeMaximo: null,
      activo: true
    };
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
  }

  editar(concurso: Concurso): void {
    this.editando = true;
    this.form = {
      id: concurso.id,
      nombre: concurso.nombre,
      descripcion: concurso.descripcion || '',
      tipo: concurso.tipo || '',
      fechaInicio: concurso.fechaInicio || '',
      fechaFin: concurso.fechaFin || '',
      puntajeMaximo: concurso.puntajeMaximo || null,
      activo: concurso.activo ?? true
    };
    this.modalAbierto = true;
  }

  guardar(): void {
    if (!this.form.nombre || this.form.nombre.trim() === '') {
      alert('Por favor ingrese el nombre del concurso');
      return;
    }

    this.guardando = true;

    const payload = {
      nombre: this.form.nombre.trim(),
      descripcion: this.form.descripcion?.trim() || null,
      tipo: this.form.tipo?.trim() || null,
      fecha_inicio: this.form.fechaInicio || null,
      fecha_fin: this.form.fechaFin || null,
      puntaje_maximo: this.form.puntajeMaximo || null,
      activo: this.form.activo
    };

    const req = this.editando
      ? this.concursoService.actualizar(this.form.id, payload)
      : this.concursoService.crear(payload);

    req.subscribe({
      next: () => {
        this.guardando = false;
        this.modalAbierto = false;
        this.cargar();
        alert(this.editando ? 'Concurso actualizado correctamente' : 'Concurso creado correctamente');
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
      },
      error: (err) => {
        this.guardando = false;
        console.error('Error guardando concurso:', err);
        alert(err.error?.mensaje || 'Error al guardar el concurso');
      }
    });
  }

  /**
   * Abre un modal de solo lectura con el detalle completo del concurso:
   * datos generales, proyectos inscritos y estado de su rúbrica.
   */
  verConcurso(concurso: Concurso): void {
    this.concursoSeleccionado = concurso;
    this.modalDetalleAbierto = true;
    this.cargandoDetalle = true;
    this.proyectosDelConcurso = [];
    this.rubricaDelConcurso = null;
    this.tieneRubricaConfigurada = false;

    // Proyectos inscritos en este concurso
    this.proyectoService.listar().subscribe({
      next: (proyectos: any) => {
        const lista = Array.isArray(proyectos) ? proyectos : [];
        this.proyectosDelConcurso = lista.filter(p => Number(p.concursoId) === Number(concurso.id));
      },
      error: () => {
        this.proyectosDelConcurso = [];
      }
    });

    // Estado de la rúbrica de este concurso
    this.rubricaService.obtenerPorConcurso(concurso.id).subscribe({
      next: (rubrica) => {
        this.rubricaDelConcurso = rubrica;
        this.tieneRubricaConfigurada = (rubrica?.secciones?.length || 0) > 0;
        this.cargandoDetalle = false;
      },
      error: () => {
        this.rubricaDelConcurso = null;
        this.tieneRubricaConfigurada = false;
        this.cargandoDetalle = false;
      }
    });
  }

  cerrarModalDetalle(): void {
    this.modalDetalleAbierto = false;
    this.concursoSeleccionado = null;
    this.proyectosDelConcurso = [];
    this.rubricaDelConcurso = null;
  }

  editarDesdeDetalle(): void {
    if (!this.concursoSeleccionado) return;
    const concurso = this.concursoSeleccionado;
    this.cerrarModalDetalle();
    this.editar(concurso);
  }

  irARubricaDesdeDetalle(): void {
    this.cerrarModalDetalle();
    this.router.navigate(['/admin/rubricas']);
  }

  getEstadoConcursoTexto(concurso: Concurso): string {
    return getEstadoConcurso(concurso);
  }

  getEstadoConcursoColor(concurso: Concurso): string {
    return getEstadoColor(concurso);
  }

  totalCriteriosRubrica(): number {
    if (!this.rubricaDelConcurso?.secciones) return 0;
    return this.rubricaDelConcurso.secciones.reduce(
      (total: number, s: any) => total + (s.criterios?.length || 0), 0
    );
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
        alert('Concurso eliminado correctamente');
      },
      error: (err) => {
        console.error('Error eliminando concurso:', err);
        alert(err.error?.mensaje || 'Error al eliminar el concurso');
      }
    });
  }

  trackById(index: number, item: any): number {
    return item?.id ?? index;
  }
}
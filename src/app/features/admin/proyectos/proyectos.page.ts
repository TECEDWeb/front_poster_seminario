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
  IonToggle,
  IonSpinner
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
  toggleOutline,
  warningOutline
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
    IonToggle,
    IonSpinner
  ],
  templateUrl: './proyectos.page.html',
  styleUrls: ['./proyectos.page.scss']
})
export class ProyectosPage implements OnInit {

  // Propiedades principales
  proyectos: Proyecto[] = [];
  proyectosFiltrados: Proyecto[] = [];
  proyectosActivos: number = 0;
  totalParticipantes: number = 0;
  cargando: boolean = false;
  cargandoConcursos: boolean = false;

  // Filtros
  busqueda: string = '';
  filtroNivel: string = 'todos';
  filtroEstado: string = 'todos';

  // Modal de creación/edición
  modalAbierto = false;
  editando = false;
  guardando = false;
  concursosDisponibles: any[] = [];

  // Opciones para combobox
  niveles = ['Básico', 'Intermedio', 'Avanzado'];
  areas = ['Ciencias', 'Tecnología', 'Sociales', 'Humanidades', 'Ingeniería', 'Salud', 'Artes', 'Deportes'];

  // Formulario
  form: any = {
    id: null,
    nombre: '',
    descripcion: '',
    concursoId: null,
    estudianteNombre: '',
    participantesTexto: '',
    nivel: '',
    area: '',
    activo: true,
    participantes: []
  };

  // Modal de detalle
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
      checkmarkOutline, calendarOutline, starOutline, folderOutline,
      warningOutline
    });
  }

  ngOnInit(): void {
    this.cargar();
    this.cargarConcursos();
  }

  // ============================================
  // MÉTODOS PRINCIPALES
  // ============================================

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

  recargar(): void {
    this.cargar();
  }

  // ============================================
  // ESTADÍSTICAS Y FILTROS
  // ============================================

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
        p.descripcion?.toLowerCase().includes(texto) ||
        p.estudianteNombre?.toLowerCase().includes(texto)
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

  // ============================================
  // GESTIÓN DE PARTICIPANTES
  // ============================================

  contarParticipantes(texto: string): number {
    if (!texto || texto.trim() === '') return 0;
    return texto.split(',').filter(p => p.trim() !== '').length;
  }

  procesarParticipantes(texto: string): string[] {
    if (!texto || texto.trim() === '') return [];
    return texto.split(',').map(p => p.trim()).filter(p => p !== '');
  }

  obtenerParticipantesTexto(participantes: any[]): string {
    if (!participantes || participantes.length === 0) return '';
    return participantes.map(p => p.nombre).join(', ');
  }

  // ============================================
  // CRUD - ABRIR MODALES
  // ============================================

  abrirCrear(): void {
    this.editando = false;
    this.form = {
      id: null,
      nombre: '',
      descripcion: '',
      concursoId: null,
      estudianteNombre: '',
      participantesTexto: '',
      nivel: '',
      area: '',
      activo: true,
      participantes: []
    };
    this.modalAbierto = true;
  }

  editar(proyecto: Proyecto): void {
    this.editando = true;

    // Convertir participantes a texto separado por comas
    const participantesTexto = this.obtenerParticipantesTexto(proyecto.participantes || []);

    this.form = {
      id: proyecto.id,
      nombre: proyecto.nombre || '',
      descripcion: proyecto.descripcion || '',
      concursoId: proyecto.concursoId != null ? Number(proyecto.concursoId) : null,
      estudianteNombre: proyecto.estudianteNombre || '',
      participantesTexto: participantesTexto,
      nivel: proyecto.nivel || '',
      area: proyecto.area || '',
      activo: proyecto.activo ?? true,
      participantes: proyecto.participantes || []
    };

    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  // ============================================
  // CRUD - GUARDAR
  // ============================================

  guardar(): void {
    // Validaciones
    if (!this.form.nombre || this.form.nombre.trim() === '') {
      alert('Por favor ingrese el nombre del proyecto');
      return;
    }

    if (!this.form.estudianteNombre || this.form.estudianteNombre.trim() === '') {
      alert('Por favor ingrese el nombre del estudiante principal');
      return;
    }

    if (!this.form.nivel) {
      alert('Por favor seleccione un nivel');
      return;
    }

    if (!this.form.area) {
      alert('Por favor seleccione un área');
      return;
    }

    // Procesar participantes
    const participantes = this.procesarParticipantes(this.form.participantesTexto);
    if (participantes.length === 0) {
      alert('Por favor ingrese al menos un participante');
      return;
    }

    this.guardando = true;

    const payload = {
      nombre: this.form.nombre.trim(),
      descripcion: this.form.descripcion || null,
      concursoId: this.form.concursoId || null,
      estudiante_nombre: this.form.estudianteNombre.trim(),
      participantes: participantes,
      nivel: this.form.nivel,
      area: this.form.area,
      activo: this.form.activo ?? true
    };

    const req = this.editando
      ? this.proyectoService.actualizar(this.form.id, payload)
      : this.proyectoService.crear(payload);

    req.subscribe({
      next: (res: any) => {
        this.guardando = false;
        this.modalAbierto = false;
        this.cargar();
        const mensaje = this.editando ? 'Proyecto actualizado correctamente' : 'Proyecto creado correctamente';
        // Mostrar notificación de éxito
        this.mostrarNotificacion(mensaje, 'success');
      },
      error: (err) => {
        this.guardando = false;
        console.error('Error guardando proyecto:', err);
        const mensaje = err.error?.mensaje || 'Error al guardar el proyecto';
        this.mostrarNotificacion(mensaje, 'danger');
      }
    });
  }

  // ============================================
  // CRUD - ELIMINAR
  // ============================================

  confirmarEliminar(proyecto: Proyecto): void {
    if (confirm(`¿Estás seguro de eliminar el proyecto "${proyecto.nombre}"? Esta acción no se puede deshacer.`)) {
      this.eliminarProyecto(proyecto.id);
    }
  }

  eliminarProyecto(id: number): void {
    this.proyectoService.eliminar(id).subscribe({
      next: () => {
        this.cargar();
        this.mostrarNotificacion('Proyecto eliminado correctamente', 'success');
      },
      error: (err) => {
        console.error('Error eliminando proyecto:', err);
        const mensaje = err.error?.mensaje || 'Error al eliminar el proyecto';
        this.mostrarNotificacion(mensaje, 'danger');
      }
    });
  }

  // ============================================
  // DETALLE DEL PROYECTO
  // ============================================

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

  editarDesdeDetalle(): void {
    if (!this.proyectoSeleccionado) return;
    const proyecto = this.proyectoSeleccionado;
    this.cerrarModalDetalle();
    this.editar(proyecto);
  }

  // ============================================
  // UTILIDADES
  // ============================================

  compararConcurso = (c1: any, c2: any): boolean => {
    return c1 != null && c2 != null ? Number(c1) === Number(c2) : c1 === c2;
  };

  getEstadoEvaluacion(estado: string): string {
    return estado === 'evaluado' ? 'status-excellent' : 'status-regular';
  }

  nombreConcurso(proyecto: Proyecto): string {
    return proyecto.concursoNombre || (proyecto.concursoId ? `Concurso #${proyecto.concursoId}` : 'Sin concurso');
  }

  trackById(index: number, item: any): number {
    return item?.id ?? index;
  }

  // Notificación simple (puedes reemplazar con ToastController)
  mostrarNotificacion(mensaje: string, tipo: 'success' | 'danger' | 'warning' = 'success'): void {
    // Por ahora usamos alert, pero recomiendo implementar Toast
    alert(mensaje);
  }

  // Obtener iniciales del nombre
  getInitials(nombre: string): string {
    if (!nombre) return '?';
    return nombre.charAt(0).toUpperCase();
  }
}
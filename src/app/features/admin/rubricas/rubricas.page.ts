import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
  IonFabButton,
  IonChip,
  IonLabel,
  IonSpinner,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonModal,
  IonItem,
  IonInput,
  IonTextarea,
  IonToggle,
  IonDatetime
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
  downloadOutline,
  refreshOutline,
  searchOutline,
  funnelOutline,
  closeOutline,
  alertCircleOutline,
  checkmarkOutline,
  documentTextOutline,
  folderOutline,
  pricetagOutline,
  starOutline,
  trophyOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-rubricas',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
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
    IonFabButton,
    IonChip,
    IonLabel,
    IonSpinner,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonModal,
    IonItem,
    IonInput,
    IonTextarea,
    IonToggle,
    IonDatetime
  ],
  templateUrl: './rubricas.page.html',
  styleUrls: ['./rubricas.page.scss']
})
export class RubricasPage implements OnInit {

  rubricas: RubricaConcurso[] = [];
  rubricasFiltradas: RubricaConcurso[] = [];
  cargando: boolean = false;
  error: string | null = null;
  totalSecciones: number = 0;
  totalNiveles: number = 0;
  totalCriteriosGlobal: number = 0;

  // Filtros
  filtroBusqueda: string = '';
  filtroSecciones: string = 'todos';

  // Modal
  modalAbierto = false;
  editando = false;
  guardando = false;
  concursosDisponibles: any[] = [];

  form: any = {
    id: null,
    concursoId: null,
    nombre: '',
    descripcion: '',
    puntajeMaximo: 100
  };

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
      downloadOutline,
      refreshOutline,
      searchOutline,
      funnelOutline,
      closeOutline,
      alertCircleOutline,
      checkmarkOutline,
      documentTextOutline,
      folderOutline,
      pricetagOutline,
      starOutline,
      trophyOutline
    });
  }

  ngOnInit(): void {
    this.cargarRubricas();
    this.cargarConcursos();
  }

  cargarRubricas(): void {
    this.cargando = true;
    this.error = null;

    this.rubricaService.listar().subscribe({
      next: (res) => {
        console.log('Rúbricas cargadas:', res);
        this.rubricas = res || [];
        this.calcularEstadisticas();
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando rúbricas:', err);
        this.error = err.error?.mensaje || 'Error al cargar las rúbricas';
        this.rubricas = [];
        this.rubricasFiltradas = [];
        this.cargando = false;
      }
    });
  }

  cargarConcursos(): void {
    this.rubricaService.obtenerConcursos().subscribe({
      next: (res) => {
        this.concursosDisponibles = res || [];
        console.log('Concursos disponibles:', this.concursosDisponibles);
      },
      error: (err) => {
        console.error('Error cargando concursos:', err);
        this.concursosDisponibles = [];
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
    this.totalCriteriosGlobal = this.rubricas.reduce(
      (total, r) => total + this.totalCriterios(r), 0
    );
  }

  aplicarFiltros(): void {
    let filtered = [...this.rubricas];

    if (this.filtroBusqueda.trim()) {
      const texto = this.filtroBusqueda.toLowerCase().trim();
      filtered = filtered.filter(r =>
        r.concursoId.toString().includes(texto)
      );
    }

    if (this.filtroSecciones !== 'todos') {
      const minSecciones = parseInt(this.filtroSecciones);
      filtered = filtered.filter(r => (r.secciones?.length || 0) >= minSecciones);
    }

    this.rubricasFiltradas = filtered;
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

  recargar(): void {
    this.cargarRubricas();
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroSecciones = 'todos';
    this.aplicarFiltros();
  }

  // =========================
  // MODAL - ABRIR CREAR
  // =========================
  abrirCrear(): void {
    this.editando = false;
    this.form = {
      id: null,
      concursoId: null,
      nombre: '',
      descripcion: '',
      puntajeMaximo: 100
    };
    this.modalAbierto = true;
  }

  // =========================
  // MODAL - CERRAR
  // =========================
  cerrarModal(): void {
    this.modalAbierto = false;
  }

  // =========================
  // MODAL - EDITAR
  // =========================
  editar(rubrica: RubricaConcurso): void {
    this.editando = true;
    // Buscar el concurso correspondiente
    const concurso = this.concursosDisponibles.find(c => c.id === rubrica.concursoId);
    
    this.form = {
      id: rubrica.concursoId,
      concursoId: rubrica.concursoId,
      nombre: concurso?.nombre || `Rúbrica del concurso #${rubrica.concursoId}`,
      descripcion: concurso?.descripcion || '',
      puntajeMaximo: 100
    };
    this.modalAbierto = true;
  }

  // =========================
  // MODAL - GUARDAR
  // =========================
  guardar(): void {
    // Validar que tenga concurso seleccionado
    if (!this.form.concursoId) {
      alert('Por favor seleccione un concurso');
      return;
    }

    // Validar que tenga nombre
    if (!this.form.nombre || this.form.nombre.trim() === '') {
      alert('Por favor ingrese el nombre de la rúbrica');
      return;
    }

    this.guardando = true;

    // Construir payload - IMPORTANTE: enviar los campos correctos
    const payload = {
      concurso_id: this.form.concursoId,
      nombre: this.form.nombre.trim(),
      descripcion: this.form.descripcion || null,
      puntaje_maximo: this.form.puntajeMaximo || 100,
      secciones: [],
      niveles: []
    };

    console.log('📤 PAYLOAD COMPLETO:', JSON.stringify(payload, null, 2));
    console.log('📤 TIPO DE DATOS:', {
      concurso_id: typeof payload.concurso_id,
      nombre: typeof payload.nombre,
      descripcion: typeof payload.descripcion,
      puntaje_maximo: typeof payload.puntaje_maximo,
      secciones: Array.isArray(payload.secciones),
      niveles: Array.isArray(payload.niveles)
    });


    console.log('📤 Enviando payload:', payload);

    const req = this.editando
      ? this.rubricaService.actualizar(this.form.id, payload)
      : this.rubricaService.crear(payload);

    req.subscribe({
      next: () => {
        this.guardando = false;
        this.modalAbierto = false;
        this.cargarRubricas();
        alert(this.editando ? 'Rúbrica actualizada correctamente' : 'Rúbrica creada correctamente');
      },
      error: (err) => {
        this.guardando = false;
        console.error('Error guardando rúbrica:', err);
        alert(err.error?.mensaje || 'Error al guardar la rúbrica');
      }
    });
  }

  // =========================
  // ELIMINAR RÚBRICA
  // =========================
  confirmarEliminar(rubrica: RubricaConcurso): void {
    if (confirm(`¿Estás seguro de eliminar la rúbrica del concurso #${rubrica.concursoId}?`)) {
      this.eliminarRubrica(rubrica.concursoId);
    }
  }

  eliminarRubrica(concursoId: number): void {
    this.rubricaService.eliminar(concursoId).subscribe({
      next: () => {
        this.cargarRubricas();
        alert('Rúbrica eliminada correctamente');
      },
      error: (err) => {
        console.error('Error eliminando rúbrica:', err);
        alert(err.error?.mensaje || 'Error al eliminar la rúbrica');
      }
    });
  }

  // =========================
  // EXPORTAR RÚBRICA
  // =========================
  exportarRubrica(rubrica: RubricaConcurso): void {
    console.log('Exportando rúbrica:', rubrica);
    alert(`Exportando rúbrica del concurso #${rubrica.concursoId}`);
  }

  // =========================
  // VER DETALLE
  // =========================
  verDetalle(rubrica: RubricaConcurso): void {
    console.log('Ver detalle:', rubrica);
    alert(`Ver detalle de la rúbrica #${rubrica.concursoId}`);
  }

  // =========================
  // UTILITIES
  // =========================
  getStatusClass(seccionesCount: number): string {
    if (seccionesCount >= 3) return 'status-excellent';
    if (seccionesCount >= 2) return 'status-good';
    if (seccionesCount >= 1) return 'status-regular';
    return 'status-low';
  }

  getStatusText(seccionesCount: number): string {
    if (seccionesCount >= 3) return 'Completa';
    if (seccionesCount >= 2) return 'Adecuada';
    if (seccionesCount >= 1) return 'Básica';
    return 'Sin secciones';
  }

  trackById(index: number, item: RubricaConcurso): number {
    return item?.concursoId ?? index;
  }
}
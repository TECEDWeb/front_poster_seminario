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
  IonItem,
  IonSpinner
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
    IonItem,
    IonSpinner
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

  // Modal
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

  constructor(
    private concursoService: ConcursoService,
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
    
    // Escuchar parámetros de la URL para abrir el modal desde el dashboard
    this.route.queryParams.subscribe(params => {
      if (params['openModal'] === 'true') {
        // Esperar a que los datos se carguen antes de abrir el modal
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

  // =========================
  // MODAL
  // =========================
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
    // Limpiar parámetros de la URL
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
        // Limpiar parámetros de la URL
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

  verConcurso(id: number): void {
    console.log('Ver concurso ID:', id);
    // Navegar a detalle del concurso
    // this.router.navigate(['/admin/concursos', id]);
    alert(`Ver detalle del concurso #${id}`);
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
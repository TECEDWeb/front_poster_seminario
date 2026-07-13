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
  folderOutline, personOutline, toggleOutline } from 'ionicons/icons';

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
    nivel: '',
    area: '',
    activo: true,
    participantes: []
  };

  constructor(
    private proyectoService: ProyectoService,
    private concursoService: ConcursoService
  ) {
    addIcons({refreshOutline,addOutline,searchOutline,documentTextOutline,businessOutline,barChartOutline,peopleOutline,trophyOutline,eyeOutline,createOutline,trashOutline,folderOpenOutline,closeOutline,pricetagOutline,personOutline,toggleOutline,checkmarkOutline,calendarOutline,starOutline,folderOutline});
  }

  ngOnInit(): void {
    this.cargar();
    this.cargarConcursos();
  }

  cargar(): void {
    this.cargando = true;

    this.proyectoService.listar().subscribe({
      next: (res: any) => {
        console.log('PROYECTOS:', res);
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
    this.concursoService.listar().subscribe({
      next: (res: any) => {
        this.concursosDisponibles = res?.data ?? res ?? [];
        console.log('Concursos disponibles:', this.concursosDisponibles);
      },
      error: (err) => {
        console.error('Error cargando concursos:', err);
        this.concursosDisponibles = [];
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
    const estudiante = proyecto.participantes && proyecto.participantes.length > 0
      ? proyecto.participantes[0].nombre
      : '';

    this.form = {
      id: proyecto.id,
      nombre: proyecto.nombre || '',
      descripcion: proyecto.descripcion || '',
      concursoId: proyecto.concursoId || null,
      estudianteNombre: estudiante,
      nivel: proyecto.nivel || '',
      area: proyecto.area || '',
      activo: proyecto.activo ?? true,
      participantes: proyecto.participantes || []
    };
    this.modalAbierto = true;
  }

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

    console.log('📤 Enviando payload:', payload);

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

  verDetalle(id: number): void {
    console.log('Ver detalle del proyecto:', id);
    alert(`Ver detalle del proyecto #${id}`);
  }

  confirmarEliminar(proyecto: Proyecto): void {
    if (confirm(`¿Estás seguro de eliminar el proyecto "${proyecto.nombre}"?`)) {
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

  trackById(index: number, item: any): number {
    return item?.id ?? index;
  }
}
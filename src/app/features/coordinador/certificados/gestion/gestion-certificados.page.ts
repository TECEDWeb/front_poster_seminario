import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonSkeletonText,
  IonSelect,
  IonSelectOption,
  IonModal,
  IonInput,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  refreshOutline,
  downloadOutline,
  trashOutline,
  eyeOutline,
  addOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  timeOutline,
  ribbonOutline,
  peopleOutline,
  documentTextOutline,
  calendarOutline,
  printOutline,
  shareOutline,
  closeOutline,
  folderOutline,
  informationCircleOutline,
  trophyOutline
} from 'ionicons/icons';
import { CertificadoService } from 'src/app/core/services/certificado.service';
import { ConcursoService } from 'src/app/core/services/concurso.service';
import { ProyectoService } from 'src/app/core/services/proyecto.service';

@Component({
  selector: 'app-gestion-certificados',
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
    IonButton,
    IonIcon,
    IonSearchbar,
    IonSkeletonText,
    IonSelect,
    IonSelectOption,
    IonModal,
    IonInput
  ],
  templateUrl: './gestion-certificados.page.html',
  styleUrls: ['./gestion-certificados.page.scss']
})
export class GestionCertificadosPage implements OnInit {

  // ============ DATOS ============
  certificados: any[] = [];
  certificadosFiltrados: any[] = [];
  concursos: any[] = [];
  // El HTML usa "concursoAsignado" como nombre; se mantiene la misma
  // variable que antes (concursoSeleccionado) pero expuesta también
  // bajo este nombre para que el template funcione sin más cambios.
  concursoAsignado: any = null;
  proyectosDisponibles: any[] = [];

  // ============ ESTADOS ============
  cargando: boolean = true;
  guardando: boolean = false;

  filtroBusqueda: string = '';
  filtroEstado: string = 'todos';
  filtroTipo: string = 'todos';

  // ============ MODAL: DETALLE ============
  modalDetalleAbierto: boolean = false;
  certificadoSeleccionado: any = null;

  // ============ MODAL: CREAR ============
  // ============ MODAL: CREAR ============
  modalCrearAbierto: boolean = false;
  formCertificado: {
    proyectoId: number | null;
    participanteNombre: string;
    participanteCedula: string;
    tipoCertificado: string;
    rol: 'participante' | 'tutor';
    nombreEvento: string;
    categoriaActividad: string;
    fechaEvento: string;
    lugar: string;
  } = {
    proyectoId: null,
    participanteNombre: '',
    participanteCedula: '',
    tipoCertificado: '',
    rol: 'participante',
    nombreEvento: '',
    categoriaActividad: '',
    fechaEvento: '',
    lugar: ''
  };

  // ============ ESTADÍSTICAS ============
  stats = {
    total: 0,
    activos: 0,
    inactivos: 0,
    pendientes: 0
  };

  constructor(
    private certificadoService: CertificadoService,
    private concursoService: ConcursoService,
    private proyectoService: ProyectoService,
    private router: Router
  ) {
    addIcons({
      searchOutline,
      refreshOutline,
      downloadOutline,
      trashOutline,
      eyeOutline,
      addOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      timeOutline,
      ribbonOutline,
      peopleOutline,
      documentTextOutline,
      calendarOutline,
      printOutline,
      shareOutline,
      closeOutline,
      folderOutline,
      informationCircleOutline,
      trophyOutline
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.cargarProyectosDisponibles();
  }

  // ============ MÉTODOS DE CARGA ============

  cargarDatos(): void {
    this.cargando = true;
    this.cargarConcursos();
  }

  cargarConcursos(): void {
    this.concursoService.listarActivos().subscribe({
      next: (concursos: any) => {
        this.concursos = concursos?.data ?? concursos ?? [];
        if (this.concursos.length > 0) {
          this.concursoAsignado = this.concursos[0];
          this.cargarCertificados(this.concursoAsignado.id);
        } else {
          this.cargando = false;
        }
      },
      error: () => {
        this.cargando = false;
        this.mostrarMensaje('Error al cargar los concursos', 'error');
      }
    });
  }

  cargarCertificados(concursoId: number): void {
    this.cargando = true;
    this.certificadoService.listarPorConcurso(concursoId).subscribe({
      next: (certificados: any) => {
        this.certificados = certificados?.data ?? certificados ?? [];
        this.calcularEstadisticas();
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: () => {
        this.certificados = [];
        this.certificadosFiltrados = [];
        this.cargando = false;
        this.mostrarMensaje('Error al cargar los certificados', 'error');
      }
    });
  }

  cargarProyectosDisponibles(): void {
    this.proyectoService.listar().subscribe({
      next: (res: any) => {
        this.proyectosDisponibles = res?.data ?? res ?? [];
      },
      error: () => {
        this.proyectosDisponibles = [];
      }
    });
  }

  // ============ FILTROS ============

  aplicarFiltros(): void {
    let filtered = [...this.certificados];

    if (this.filtroBusqueda.trim()) {
      const texto = this.filtroBusqueda.toLowerCase().trim();
      filtered = filtered.filter(c =>
        (c.nombre || '').toLowerCase().includes(texto) ||
        (c.codigo || '').toLowerCase().includes(texto) ||
        (c.tipo || '').toLowerCase().includes(texto) ||
        (c.cedula || '').includes(texto)
      );
    }

    if (this.filtroEstado !== 'todos') {
      filtered = filtered.filter(c => c.estado === this.filtroEstado);
    }

    if (this.filtroTipo !== 'todos') {
      filtered = filtered.filter(c => c.tipo === this.filtroTipo);
    }

    this.certificadosFiltrados = filtered;
  }

  calcularEstadisticas(): void {
    this.stats.total = this.certificados.length;
    this.stats.activos = this.certificados.filter(c => c.estado === 'activo' || c.activo).length;
    this.stats.inactivos = this.certificados.filter(c => c.estado === 'inactivo' || !c.activo).length;
    this.stats.pendientes = this.certificados.filter(c => c.estado === 'pendiente').length;
  }

  // ============ ACCIONES ============

  recargar(): void {
    this.cargarDatos();
  }

  // ---- Modal de detalle ----
  verDetalle(certificado: any): void {
    this.certificadoSeleccionado = certificado;
    this.modalDetalleAbierto = true;
  }

  cerrarModalDetalle(): void {
    this.modalDetalleAbierto = false;
    this.certificadoSeleccionado = null;
  }

  // ---- Modal de crear ----
  abrirCrear(): void {
    this.formCertificado = {
      proyectoId: null,
      participanteNombre: '',
      participanteCedula: '',
      tipoCertificado: '',
      rol: 'participante',
      nombreEvento: this.concursoAsignado?.nombre || '',
      categoriaActividad: '',
      fechaEvento: '',
      lugar: ''
    };
    this.modalCrearAbierto = true;
  }

  cerrarModalCrear(): void {
    this.modalCrearAbierto = false;
    this.guardando = false;
  }

  guardarCertificado(): void {
    const f = this.formCertificado;

    if (!f.proyectoId || !f.participanteNombre.trim() || !f.participanteCedula.trim() ||
        !f.tipoCertificado || !f.nombreEvento.trim() || !f.categoriaActividad.trim() || !f.fechaEvento) {
      this.mostrarMensaje('Completa todos los campos obligatorios', 'warning');
      return;
    }

    this.guardando = true;

    const payload = {
      proyectoId: f.proyectoId,
      participanteNombre: f.participanteNombre.trim(),
      participanteCedula: f.participanteCedula.trim(),
      tipoCertificado: f.tipoCertificado,
      rol: f.rol,
      nombreEvento: f.nombreEvento.trim(),
      categoriaActividad: f.categoriaActividad.trim(),
      fechaEvento: f.fechaEvento,
      lugar: f.lugar.trim() || undefined
    };

    this.certificadoService.generar(payload).subscribe({
      next: () => {
        this.guardando = false;
        this.modalCrearAbierto = false;
        this.mostrarMensaje('Certificado creado correctamente', 'success');
        if (this.concursoAsignado?.id) {
          this.cargarCertificados(this.concursoAsignado.id);
        }
      },
      error: (err) => {
        this.guardando = false;
        console.error('Error creando certificado:', err);
        this.mostrarMensaje(err.error?.mensaje || 'Error al crear el certificado', 'error');
      }
    });
  }

  descargarCertificado(certificado: any): void {
    if (!certificado?.id) return;

    this.certificadoService.descargarPdf(certificado.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificado-${certificado.codigo || certificado.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.mostrarMensaje('Certificado descargado exitosamente', 'success');
      },
      error: () => {
        this.mostrarMensaje('Error al descargar el certificado', 'error');
      }
    });
  }

  eliminarCertificado(certificado: any): void {
    if (!certificado?.id) return;
    if (!confirm(`¿Está seguro de eliminar el certificado de ${certificado.nombre || 'este participante'}?`)) return;

    this.certificadoService.eliminar(certificado.id).subscribe({
      next: () => {
        this.mostrarMensaje('Certificado eliminado exitosamente', 'success');
        if (this.concursoAsignado?.id) {
          this.cargarCertificados(this.concursoAsignado.id);
        }
        this.cerrarModalDetalle();
      },
      error: () => {
        this.mostrarMensaje('Error al eliminar el certificado', 'error');
      }
    });
  }

  // ============ MENSAJES ============

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error' | 'warning'): void {
    const prefijo = tipo === 'success' ? '[OK]' : tipo === 'warning' ? '[Aviso]' : '[Error]';
    alert(`${prefijo} ${mensaje}`);
  }

  // ============ UTILIDADES DE ESTADO/TIPO ============

  getEstadoClass(estado: string): string {
    const map: Record<string, string> = {
      'activo': 'estado-activo',
      'inactivo': 'estado-inactivo',
      'pendiente': 'estado-pendiente',
      'generado': 'estado-generado',
      'entregado': 'estado-entregado'
    };
    return map[estado] || 'estado-pendiente';
  }

  getEstadoIcon(estado: string): string {
    const map: Record<string, string> = {
      'activo': 'checkmark-circle-outline',
      'inactivo': 'close-circle-outline',
      'pendiente': 'time-outline',
      'generado': 'ribbon-outline',
      'entregado': 'share-outline'
    };
    return map[estado] || 'help-circle-outline';
  }

  getEstadoText(estado: string): string {
    const map: Record<string, string> = {
      'activo': 'Activo',
      'inactivo': 'Inactivo',
      'pendiente': 'Pendiente',
      'generado': 'Generado',
      'entregado': 'Entregado'
    };
    return map[estado] || estado || 'Desconocido';
  }

  getTipoText(tipo: string): string {
    const map: Record<string, string> = {
      'participacion': 'Participación',
      'ganador': 'Ganador',
      'reconocimiento': 'Reconocimiento',
      'mejor_proyecto': 'Mejor Proyecto'
    };
    return map[tipo] || tipo || 'No especificado';
  }

  trackById(index: number, item: any): number {
    return item?.id ?? index;
  }
}
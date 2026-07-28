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
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  searchOutline,
  peopleOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  checkmarkCircle,
  ellipseOutline,
  squareOutline
} from 'ionicons/icons';

import { UsuarioService } from '../../../core/services/usuario.service';

@Component({
  selector: 'app-seleccionar-evaluador-modal',
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
    IonSkeletonText,
  ],
  templateUrl: './seleccionar-evaluador-modal.component.html',
  styleUrls: ['./seleccionar-evaluador-modal.component.scss']
})
export class SeleccionarEvaluadorModalComponent implements OnInit {

  @Input() isOpen = false;
  @Input() evaluadorSeleccionadoId: number | null = null;
  @Input() modoMultiple = false;
  @Input() evaluadoresSeleccionadosIds: number[] = [];
  
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() evaluadorSeleccionado = new EventEmitter<number>();
  @Output() evaluadoresSeleccionadosChange = new EventEmitter<number[]>();

  evaluadores: any[] = [];
  evaluadoresFiltrados: any[] = [];

  cargando = false;
  filtroBusqueda = '';

  // Para modo múltiple
  seleccionadosInternos: number[] = [];

  constructor(
    private usuarioService: UsuarioService
  ) {
    addIcons({
      closeOutline,
      searchOutline,
      peopleOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      checkmarkCircle,
      ellipseOutline,
      squareOutline
    });
  }

  ngOnInit(): void {
    this.cargarEvaluadores();
  }

  ngOnChanges(): void {
    if (this.modoMultiple) {
      this.seleccionadosInternos = [...this.evaluadoresSeleccionadosIds];
    }
  }

  cargarEvaluadores(): void {
    this.cargando = true;
    this.usuarioService.getEvaluadores().subscribe({
      next: (res: any) => {
        if (res && res.ok && res.data) {
          this.evaluadores = res.data;
        } else {
          this.evaluadores = res ?? [];
        }
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando evaluadores:', err);
        this.evaluadores = [];
        this.evaluadoresFiltrados = [];
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    let filtrados = [...this.evaluadores];

    if (this.filtroBusqueda.trim()) {
      const busqueda = this.filtroBusqueda.toLowerCase().trim();
      filtrados = filtrados.filter(e => {
        const nombre = (e.nombre || '').toLowerCase();
        const especialidad = (e.especialidad || e.rol || '').toLowerCase();
        return nombre.includes(busqueda) || especialidad.includes(busqueda);
      });
    }

    this.evaluadoresFiltrados = filtrados;
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.aplicarFiltros();
  }

  // ==========================================================
  // MÉTODOS PARA EL TEMPLATE
  // ==========================================================
  isAllSelected(): boolean {
    if (this.evaluadoresFiltrados.length === 0) return false;
    return this.evaluadoresFiltrados.every(e => this.seleccionadosInternos.includes(e.id));
  }

  getTodosText(): string {
    return this.isAllSelected() ? 'Deseleccionar todos' : 'Seleccionar todos';
  }

  getToggleIcon(): string {
    return this.isAllSelected() ? 'checkmark-circle' : 'square-outline';
  }

  // ==========================================================
  // SELECCIÓN
  // ==========================================================
  seleccionarEvaluador(evaluadorId: number): void {
    if (this.modoMultiple) {
      this.toggleSeleccionMultiple(evaluadorId);
    } else {
      this.evaluadorSeleccionado.emit(evaluadorId);
      this.cerrarModal();
    }
  }

  toggleSeleccionMultiple(evaluadorId: number): void {
    const index = this.seleccionadosInternos.indexOf(evaluadorId);
    if (index > -1) {
      this.seleccionadosInternos.splice(index, 1);
    } else {
      this.seleccionadosInternos.push(evaluadorId);
    }
  }

  estaSeleccionado(evaluadorId: number): boolean {
    if (this.modoMultiple) {
      return this.seleccionadosInternos.includes(evaluadorId);
    }
    return this.evaluadorSeleccionadoId === evaluadorId;
  }

  toggleAll(): void {
    const filtrados = this.evaluadoresFiltrados;
    const idsFiltrados = filtrados.map(e => e.id);
    const todosSeleccionados = idsFiltrados.every(id => this.seleccionadosInternos.includes(id));

    if (todosSeleccionados) {
      idsFiltrados.forEach(id => {
        const index = this.seleccionadosInternos.indexOf(id);
        if (index > -1) {
          this.seleccionadosInternos.splice(index, 1);
        }
      });
    } else {
      idsFiltrados.forEach(id => {
        if (!this.seleccionadosInternos.includes(id)) {
          this.seleccionadosInternos.push(id);
        }
      });
    }
  }

  confirmarSeleccionMultiple(): void {
    this.evaluadoresSeleccionadosChange.emit(this.seleccionadosInternos);
    this.cerrarModal();
  }

  cerrarModal(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }
}
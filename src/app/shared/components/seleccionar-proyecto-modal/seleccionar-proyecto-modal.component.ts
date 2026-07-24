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
  IonLabel,
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
    IonLabel,
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
    this.cargarConcursos();
    this.cargarProyectos();
  }

  cargarConcursos(): void {
    this.concursoService.listar().subscribe({
      next: (res: any) => {
        this.concursos = res?.data ?? res ?? [];
      },
      error: (err) => {
        console.error('Error cargando concursos:', err);
        this.concursos = [];
      }
    });
  }

  cargarProyectos(): void {
    this.proyectoService.listar().subscribe({
      next: (res: any) => {
        this.proyectos = res?.data ?? res?.proyectos ?? res ?? [];
        this.aplicarFiltros();
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

  aplicarFiltros(): void {
    let filtrados = [...this.proyectos];

    if (this.filtroConcursoId) {
      filtrados = filtrados.filter(p => Number(p.concurso_id) === Number(this.filtroConcursoId));
    }

    if (this.filtroBusqueda.trim()) {
      const busqueda = this.filtroBusqueda.toLowerCase().trim();
      filtrados = filtrados.filter(p => {
        const nombre = (p.nombre || '').toLowerCase();
        const area = (p.area || '').toLowerCase();
        const nivel = (p.nivel || '').toLowerCase();
        return nombre.includes(busqueda) || area.includes(busqueda) || nivel.includes(busqueda);
      });
    }

    this.proyectosFiltrados = filtrados;
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

  getNombreConcurso(concursoId: number): string {
    const concurso = this.concursos.find(c => Number(c.id) === Number(concursoId));
    return concurso?.nombre || `Concurso #${concursoId}`;
  }
}
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
  IonItem,
  IonBadge,
  IonSkeletonText,
  IonAvatar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  searchOutline,
  peopleOutline,
  checkmarkCircleOutline,
  alertCircleOutline
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
    IonItem,
    IonBadge,
    IonSkeletonText,
    IonAvatar
  ],
  templateUrl: './seleccionar-evaluador-modal.component.html',
  styleUrls: ['./seleccionar-evaluador-modal.component.scss']
})
export class SeleccionarEvaluadorModalComponent implements OnInit {

  @Input() isOpen = false;
  @Input() evaluadorSeleccionadoId: number | null = null;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() evaluadorSeleccionado = new EventEmitter<number>();

  evaluadores: any[] = [];
  evaluadoresFiltrados: any[] = [];

  cargando = false;
  filtroBusqueda = '';

  constructor(
    private usuarioService: UsuarioService
  ) {
    addIcons({
      closeOutline,
      searchOutline,
      peopleOutline,
      checkmarkCircleOutline,
      alertCircleOutline
    });
  }

  ngOnInit(): void {
    this.cargarEvaluadores();
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

  seleccionarEvaluador(evaluadorId: number): void {
    this.evaluadorSeleccionado.emit(evaluadorId);
    this.cerrarModal();
  }

  cerrarModal(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }
}
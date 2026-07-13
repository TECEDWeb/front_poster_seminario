import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonContent, IonItem, IonInput, IonTextarea, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, createOutline, trashOutline, checkmarkOutline, closeOutline,
  chevronDownOutline, chevronForwardOutline, layersOutline, listOutline,
  starOutline, alertCircleOutline, optionsOutline, saveOutline
} from 'ionicons/icons';

import { SeccionService } from '../../../../core/services/seccion.service';
import { CriterioService } from 'src/app/core/services/cirterio.service';
import { NivelService } from '../../../../core/services/nivel.service';
import { Seccion, Criterio, Nivel } from '../../../../core/models/rubrica.model';

interface NivelUI extends Nivel {
  editando?: boolean;
  nombreTemp?: string;
  puntajeTemp?: number;
  descripcionTemp?: string | null;
}

interface CriterioUI extends Criterio {
  editando?: boolean;
  textoTemp?: string;
  mostrarNiveles?: boolean;
  cargandoNiveles?: boolean;
  nivelesPersonalizados?: NivelUI[];
  agregandoNivel?: boolean;
  nuevoNivel?: { nombre: string; puntaje: number | null; descripcion: string };
}

interface SeccionUI extends Seccion {
  criterios: CriterioUI[];
  editando?: boolean;
  nombreTemp?: string;
  descripcionTemp?: string | null;
  expandida?: boolean;
  cargandoCriterios?: boolean;
  agregandoCriterio?: boolean;
  nuevoCriterioTexto?: string;
}

@Component({
  selector: 'app-rubrica-builder',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonContent, IonItem, IonInput, IonTextarea, IonSpinner
  ],
  templateUrl: './rubrica-builder.component.html',
  styleUrls: ['./rubrica-builder.component.scss']
})
export class RubricaBuilderComponent implements OnChanges {

  @Input() concursoId!: number;
  @Input() concursoNombre: string = '';
  @Output() cerrar = new EventEmitter<void>();

  secciones: SeccionUI[] = [];
  nivelesGlobales: NivelUI[] = [];

  cargando = true;
  error: string | null = null;

  agregandoSeccion = false;
  nuevaSeccionNombre = '';
  nuevaSeccionDescripcion = '';

  agregandoNivelGlobal = false;
  nuevoNivelGlobal = { nombre: '', puntaje: null as number | null, descripcion: '' };

  constructor(
    private seccionService: SeccionService,
    private criterioService: CriterioService,
    private nivelService: NivelService
  ) {
    addIcons({
      addOutline, createOutline, trashOutline, checkmarkOutline, closeOutline,
      chevronDownOutline, chevronForwardOutline, layersOutline, listOutline,
      starOutline, alertCircleOutline, optionsOutline, saveOutline
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['concursoId'] && this.concursoId) {
      this.cargarTodo();
    }
  }

  cargarTodo(): void {
    this.cargando = true;
    this.error = null;

    this.seccionService.listarPorConcurso(this.concursoId).subscribe({
      next: (secciones) => {
        this.secciones = secciones.map(s => ({ ...s, criterios: [], expandida: true }));
        this.secciones.forEach(s => this.cargarCriterios(s));
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al cargar las secciones';
        this.cargando = false;
      }
    });

    this.nivelService.listarGlobales(this.concursoId).subscribe({
      next: (niveles) => {
        this.nivelesGlobales = niveles;
        this.cargando = false;
      },
      error: () => {
        this.nivelesGlobales = [];
        this.cargando = false;
      }
    });
  }

  // ---------- SECCIONES ----------

  cargarCriterios(seccion: SeccionUI): void {
    seccion.cargandoCriterios = true;
    this.criterioService.listarPorSeccion(seccion.id).subscribe({
      next: (criterios) => {
        seccion.criterios = criterios.map(c => ({ ...c }));
        seccion.cargandoCriterios = false;
      },
      error: () => {
        seccion.criterios = [];
        seccion.cargandoCriterios = false;
      }
    });
  }

  toggleSeccion(seccion: SeccionUI): void {
    seccion.expandida = !seccion.expandida;
  }

  abrirNuevaSeccion(): void {
    this.agregandoSeccion = true;
    this.nuevaSeccionNombre = '';
    this.nuevaSeccionDescripcion = '';
  }

  guardarNuevaSeccion(): void {
    const nombre = this.nuevaSeccionNombre.trim();
    if (!nombre) {
      alert('El nombre de la sección es obligatorio');
      return;
    }

    this.seccionService.crear({
      concursoId: this.concursoId,
      nombre,
      descripcion: this.nuevaSeccionDescripcion.trim() || null
    }).subscribe({
      next: (seccion) => {
        this.secciones.push({ ...seccion, criterios: [], expandida: true });
        this.agregandoSeccion = false;
      },
      error: (err) => alert(err.error?.mensaje || 'Error al crear la sección')
    });
  }

  editarSeccion(seccion: SeccionUI): void {
    seccion.editando = true;
    seccion.nombreTemp = seccion.nombre;
    seccion.descripcionTemp = seccion.descripcion;
  }

  guardarSeccion(seccion: SeccionUI): void {
    const nombre = (seccion.nombreTemp || '').trim();
    if (!nombre) {
      alert('El nombre no puede estar vacío');
      return;
    }

    this.seccionService.actualizar(seccion.id, {
      nombre,
      descripcion: (seccion.descripcionTemp || '').trim() || null
    }).subscribe({
      next: () => {
        seccion.nombre = nombre;
        seccion.descripcion = seccion.descripcionTemp || null;
        seccion.editando = false;
      },
      error: (err) => alert(err.error?.mensaje || 'Error al actualizar la sección')
    });
  }

  eliminarSeccion(seccion: SeccionUI): void {
    if (!confirm(`¿Eliminar la sección "${seccion.nombre}"? Debe estar vacía de criterios.`)) return;

    this.seccionService.eliminar(seccion.id).subscribe({
      next: () => {
        this.secciones = this.secciones.filter(s => s.id !== seccion.id);
      },
      error: (err) => alert(err.error?.mensaje || 'Error al eliminar la sección')
    });
  }

  // ---------- CRITERIOS ----------

  abrirNuevoCriterio(seccion: SeccionUI): void {
    seccion.agregandoCriterio = true;
    seccion.nuevoCriterioTexto = '';
  }

  guardarNuevoCriterio(seccion: SeccionUI): void {
    const texto = (seccion.nuevoCriterioTexto || '').trim();
    if (!texto) {
      alert('El texto del criterio es obligatorio');
      return;
    }

    this.criterioService.crear({ seccionId: seccion.id, texto }).subscribe({
      next: (criterio) => {
        seccion.criterios.push({ ...criterio });
        seccion.agregandoCriterio = false;
      },
      error: (err) => alert(err.error?.mensaje || 'Error al crear el criterio')
    });
  }

  editarCriterio(criterio: CriterioUI): void {
    criterio.editando = true;
    criterio.textoTemp = criterio.texto;
  }

  guardarCriterio(criterio: CriterioUI): void {
    const texto = (criterio.textoTemp || '').trim();
    if (!texto) {
      alert('El texto no puede estar vacío');
      return;
    }

    this.criterioService.actualizar(criterio.id, { texto }).subscribe({
      next: () => {
        criterio.texto = texto;
        criterio.editando = false;
      },
      error: (err) => alert(err.error?.mensaje || 'Error al actualizar el criterio')
    });
  }

  eliminarCriterio(seccion: SeccionUI, criterio: CriterioUI): void {
    if (!confirm(`¿Eliminar el criterio "${criterio.texto}"?`)) return;

    this.criterioService.eliminar(criterio.id).subscribe({
      next: () => {
        seccion.criterios = seccion.criterios.filter(c => c.id !== criterio.id);
      },
      error: (err) => alert(err.error?.mensaje || 'Error al eliminar el criterio')
    });
  }

  // ---------- NIVELES PERSONALIZADOS POR CRITERIO ----------

  toggleNivelesPersonalizados(criterio: CriterioUI): void {
    criterio.mostrarNiveles = !criterio.mostrarNiveles;

    if (criterio.mostrarNiveles && !criterio.nivelesPersonalizados) {
      criterio.cargandoNiveles = true;
      this.nivelService.listarPorCriterio(criterio.id).subscribe({
        next: (niveles) => {
          criterio.nivelesPersonalizados = niveles;
          criterio.cargandoNiveles = false;
        },
        error: () => {
          criterio.nivelesPersonalizados = [];
          criterio.cargandoNiveles = false;
        }
      });
    }
  }

  abrirNuevoNivelCriterio(criterio: CriterioUI): void {
    criterio.agregandoNivel = true;
    criterio.nuevoNivel = { nombre: '', puntaje: null, descripcion: '' };
  }

  guardarNuevoNivelCriterio(criterio: CriterioUI): void {
    const nv = criterio.nuevoNivel!;
    if (!nv.nombre.trim() || nv.puntaje == null) {
      alert('Nombre y puntaje son obligatorios');
      return;
    }

    this.nivelService.crear({
      concursoId: this.concursoId,
      nombre: nv.nombre.trim(),
      puntaje: nv.puntaje,
      descripcion: nv.descripcion.trim() || null,
      criterioId: criterio.id
    }).subscribe({
      next: (nivel) => {
        criterio.nivelesPersonalizados = [...(criterio.nivelesPersonalizados || []), nivel];
        criterio.agregandoNivel = false;
      },
      error: (err) => alert(err.error?.mensaje || 'Error al crear el nivel')
    });
  }

  editarNivel(nivel: NivelUI): void {
    nivel.editando = true;
    nivel.nombreTemp = nivel.nombre;
    nivel.puntajeTemp = nivel.puntaje;
    nivel.descripcionTemp = nivel.descripcion;
  }

  guardarNivel(nivel: NivelUI, lista: NivelUI[]): void {
    const nombre = (nivel.nombreTemp || '').trim();
    if (!nombre || nivel.puntajeTemp == null) {
      alert('Nombre y puntaje son obligatorios');
      return;
    }

    this.nivelService.actualizar(nivel.id, {
      nombre,
      puntaje: nivel.puntajeTemp,
      descripcion: (nivel.descripcionTemp || '').trim() || null
    }).subscribe({
      next: () => {
        nivel.nombre = nombre;
        nivel.puntaje = nivel.puntajeTemp!;
        nivel.descripcion = nivel.descripcionTemp || null;
        nivel.editando = false;
      },
      error: (err) => alert(err.error?.mensaje || 'Error al actualizar el nivel')
    });
  }

  eliminarNivel(nivel: NivelUI, lista: NivelUI[]): void {
    if (!confirm(`¿Eliminar el nivel "${nivel.nombre}"?`)) return;

    this.nivelService.eliminar(nivel.id).subscribe({
      next: () => {
        const idx = lista.indexOf(nivel);
        if (idx > -1) lista.splice(idx, 1);
      },
      error: (err) => alert(err.error?.mensaje || 'Error al eliminar el nivel')
    });
  }

  // ---------- NIVELES GLOBALES (escala del concurso) ----------

  abrirNuevoNivelGlobal(): void {
    this.agregandoNivelGlobal = true;
    this.nuevoNivelGlobal = { nombre: '', puntaje: null, descripcion: '' };
  }

  guardarNuevoNivelGlobal(): void {
    if (!this.nuevoNivelGlobal.nombre.trim() || this.nuevoNivelGlobal.puntaje == null) {
      alert('Nombre y puntaje son obligatorios');
      return;
    }

    this.nivelService.crear({
      concursoId: this.concursoId,
      nombre: this.nuevoNivelGlobal.nombre.trim(),
      puntaje: this.nuevoNivelGlobal.puntaje,
      descripcion: this.nuevoNivelGlobal.descripcion.trim() || null
    }).subscribe({
      next: (nivel) => {
        this.nivelesGlobales.push(nivel);
        this.agregandoNivelGlobal = false;
      },
      error: (err) => alert(err.error?.mensaje || 'Error al crear el nivel')
    });
  }

  cerrarModal(): void {
    this.cerrar.emit();
  }

  trackById(index: number, item: any): number {
    return item?.id ?? index;
  }
}
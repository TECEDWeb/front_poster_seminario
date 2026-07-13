import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
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
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonModal,
  IonItem,
  IonInput,
  IonTextarea
} from '@ionic/angular/standalone';
import { RubricaService } from '../../../core/services/rubrica.service';
import { RubricaConcurso } from '../../../core/models/rubrica.model';
import { addIcons } from 'ionicons';
import { RubricaBuilderComponent } from './rubrica-builder/rubrica-builder.component';

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
  trophyOutline, filterOutline } from 'ionicons/icons';

@Component({
  selector: 'app-rubricas',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    IonContent,
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
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonModal,
    IonItem,
    IonInput,
    IonTextarea,
    RubricaBuilderComponent   
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

  filtroBusqueda: string = '';
  filtroSecciones: string = 'todos';

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

  builderAbierto = false;
  concursoSeleccionadoBuilder: number | null = null;
  concursoNombreBuilder = '';

  constructor(private rubricaService: RubricaService) {
    addIcons({refreshOutline,addOutline,closeOutline,alertCircleOutline,checkboxOutline,eyeOutline,createOutline,trashOutline,layersOutline,listOutline,checkmarkCircleOutline,downloadOutline,filterOutline,trophyOutline,pricetagOutline,documentTextOutline,starOutline,searchOutline,funnelOutline,checkmarkOutline,folderOutline});
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

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  editar(rubrica: RubricaConcurso): void {
    console.log('📝 Editando rúbrica:', rubrica);

    this.editando = true;

    const concurso = this.concursosDisponibles.find(c => c.id === rubrica.concursoId);

    const nombreRubrica = concurso?.nombre
      ? `Rúbrica: ${concurso.nombre}`
      : `Rúbrica del concurso #${rubrica.concursoId}`;

    this.form = {
      id: rubrica.concursoId,
      concursoId: rubrica.concursoId,
      nombre: nombreRubrica,
      descripcion: concurso?.descripcion || '',
      puntajeMaximo: 100
    };

    console.log('📝 Formulario después de editar:', this.form);

    this.modalAbierto = true;
  }

  guardar(): void {
    console.log('🔍 Iniciando guardar()');
    console.log('🔍 Form actual:', this.form);
    console.log('🔍 editando:', this.editando);

    if (!this.form.concursoId) {
      console.log('❌ Error: No hay concurso seleccionado');
      alert('Por favor seleccione un concurso');
      return;
    }

    if (!this.form.nombre || this.form.nombre.trim() === '') {
      console.log('❌ Error: Nombre vacío');
      console.log('❌ Valor actual de form.nombre:', this.form.nombre);
      alert('Por favor ingrese el nombre de la rúbrica');
      return;
    }

    this.guardando = true;

    const payload = {
      concurso_id: this.form.concursoId,
      nombre: this.form.nombre.trim(),
      descripcion: this.form.descripcion ? this.form.descripcion.trim() : null,
      puntaje_maximo: this.form.puntajeMaximo || 100,
      secciones: [],
      niveles: []
    };

    console.log('📤 PAYLOAD COMPLETO:', JSON.stringify(payload, null, 2));

    const req = this.editando
      ? this.rubricaService.actualizar(this.form.id, payload)
      : this.rubricaService.crear(payload);

    console.log(`📤 ${this.editando ? 'Actualizando' : 'Creando'} rúbrica...`);

    req.subscribe({
      next: (response) => {
        console.log('✅ Respuesta exitosa:', response);
        this.guardando = false;
        this.modalAbierto = false;
        this.cargarRubricas();
        alert(this.editando ? 'Rúbrica actualizada correctamente' : 'Rúbrica creada correctamente');
      },
      error: (err) => {
        console.error('❌ Error guardando rúbrica:', err);
        console.error('❌ Detalles del error:', err.error);
        this.guardando = false;

        const mensaje = err.error?.mensaje || 'Error al guardar la rúbrica';
        alert(mensaje);
      }
    });
  }

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

  exportarRubrica(rubrica: RubricaConcurso): void {
    console.log('📤 Exportando rúbrica:', rubrica);

    this.rubricaService.exportar(rubrica.concursoId).subscribe({
      next: (blob: Blob) => {
        if (!blob || blob.size === 0) {
          alert('Error: El archivo exportado está vacío');
          return;
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rubrica-concurso-${rubrica.concursoId}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log('✅ Rúbrica exportada correctamente');
      },
      error: (err) => {
        console.error('❌ Error exportando rúbrica:', err);

        let mensaje = 'Error al exportar la rúbrica';
        if (err.status === 404) {
          mensaje = 'La funcionalidad de exportación está en desarrollo.\n\n' +
                    'Por ahora, puedes ver el detalle de la rúbrica con el botón "Ver detalle".';
        } else if (err.error?.mensaje) {
          mensaje = err.error.mensaje;
        } else if (err.message) {
          mensaje = err.message;
        }

        alert(mensaje);
      }
    });
  }

  verDetalle(rubrica: RubricaConcurso): void {
    console.log('📋 Ver detalle de rúbrica:', rubrica);

    let mensaje = `📋 RÚBRICA DEL CONCURSO #${rubrica.concursoId}\n\n`;
    mensaje += `📌 SECCIONES (${rubrica.secciones?.length || 0}):\n`;

    if (rubrica.secciones && rubrica.secciones.length > 0) {
      rubrica.secciones.forEach((seccion, idx) => {
        mensaje += `\n  ${idx + 1}. ${seccion.nombre}`;
        if (seccion.descripcion) {
          mensaje += `\n     📝 ${seccion.descripcion}`;
        }
        mensaje += `\n     📋 Criterios (${seccion.criterios?.length || 0}):`;

        if (seccion.criterios && seccion.criterios.length > 0) {
          seccion.criterios.forEach((criterio, cIdx) => {
            mensaje += `\n       ${cIdx + 1}. ${criterio.texto}`;
          });
        } else {
          mensaje += `\n       (Sin criterios)`;
        }
      });
    } else {
      mensaje += `\n  (Sin secciones)`;
    }

    mensaje += `\n\n📊 NIVELES (${rubrica.niveles?.length || 0}):`;
    if (rubrica.niveles && rubrica.niveles.length > 0) {
      rubrica.niveles.forEach((nivel) => {
        mensaje += `\n  • ${nivel.nombre}: ${nivel.puntaje} pts`;
        if (nivel.descripcion) {
          mensaje += ` (${nivel.descripcion})`;
        }
      });
    } else {
      mensaje += `\n  (Sin niveles)`;
    }

    alert(mensaje);
  }

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

  abrirBuilder(rubrica: RubricaConcurso): void {
    const concurso = this.concursosDisponibles.find(c => c.id === rubrica.concursoId);
    this.concursoSeleccionadoBuilder = rubrica.concursoId;
    this.concursoNombreBuilder = concurso?.nombre || `Concurso #${rubrica.concursoId}`;
    this.builderAbierto = true;
  }
  cerrarBuilder(): void {
    this.builderAbierto = false;
    this.concursoSeleccionadoBuilder = null;
    this.cargarRubricas(); // refresca contadores de secciones/criterios/niveles
  }
}
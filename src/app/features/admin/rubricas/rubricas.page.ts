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
  pricetagOutline,
  starOutline,
  trophyOutline,
  filterOutline,
  optionsOutline,
  printOutline  // ✅ NUEVO ICONO
} from 'ionicons/icons';

interface Concurso {
  id: number;
  nombre: string;
  descripcion?: string;
}

const MODAL_TRANSITION_MS = 350;

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
  concursosDisponibles: Concurso[] = [];

  form: {
    id: number | null;
    concursoId: number | null;
    nombre: string;
    descripcion: string;
    puntajeMaximo: number;
  } = {
    id: null,
    concursoId: null,
    nombre: '',
    descripcion: '',
    puntajeMaximo: 100
  };

  builderAbierto = false;
  concursoSeleccionadoBuilder: number | null = null;
  concursoNombreBuilder = '';

  // ✅ ESTADO PARA DESCARGA
  descargando: boolean = false;

  constructor(private rubricaService: RubricaService) {
    addIcons({
      refreshOutline,
      addOutline,
      closeOutline,
      alertCircleOutline,
      checkboxOutline,
      eyeOutline,
      createOutline,
      trashOutline,
      layersOutline,
      listOutline,
      checkmarkCircleOutline,
      downloadOutline,
      filterOutline,
      trophyOutline,
      pricetagOutline,
      documentTextOutline,
      starOutline,
      searchOutline,
      funnelOutline,
      checkmarkOutline,
      optionsOutline,
      printOutline  // ✅ NUEVO
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

  // ==========================================================
  // COORDINACIÓN ENTRE MODALES
  // ==========================================================
  private cerrarBuilderYLuego(accion: () => void): void {
    if (this.builderAbierto) {
      this.builderAbierto = false;
      this.concursoSeleccionadoBuilder = null;
      setTimeout(() => accion(), MODAL_TRANSITION_MS);
    } else {
      accion();
    }
  }

  private cerrarModalYLuego(accion: () => void): void {
    if (this.modalAbierto) {
      this.modalAbierto = false;
      this.guardando = false;
      setTimeout(() => accion(), MODAL_TRANSITION_MS);
    } else {
      accion();
    }
  }

  // ========== MODAL DE EDICIÓN ==========
  abrirCrear(): void {
    this.cerrarBuilderYLuego(() => {
      this.editando = false;
      this.form = {
        id: null,
        concursoId: null,
        nombre: '',
        descripcion: '',
        puntajeMaximo: 100
      };
      this.modalAbierto = true;
    });
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.guardando = false;
  }

  editar(rubrica: RubricaConcurso): void {
    this.cerrarBuilderYLuego(() => {
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
    });
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

    const req = this.editando && this.form.id
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
        this.guardando = false;

        let mensaje = 'Error al guardar la rúbrica';
        if (err.error?.mensaje) {
          mensaje = err.error.mensaje;
        } else if (err.error?.error) {
          mensaje = err.error.error;
        } else if (err.message) {
          mensaje = err.message;
        }

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

  //  NUEVO MÉTODO: DESCARGAR RÚBRICA EN FORMATO ESTRUCTURADO
  async descargarRubrica(rubrica: RubricaConcurso): Promise<void> {
    this.descargando = true;

    try {
      // Importar jsPDF y autoTable dinámicamente
      const { default: jsPDF } = await import('jspdf');
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.default;

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // ==========================================
      // 1. ENCABEZADO
      // ==========================================
      const concurso = this.concursosDisponibles.find(c => c.id === rubrica.concursoId);
      const nombreConcurso = concurso?.nombre || `Concurso #${rubrica.concursoId}`;

      doc.setFontSize(20);
      doc.setTextColor(0, 27, 76);
      doc.text('RÚBRICA DE EVALUACIÓN', 105, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      doc.text(`Concurso: ${nombreConcurso}`, 105, 30, { align: 'center' });

      // ✅ OBTENER DESCRIPCIÓN DESDE LA PRIMERA SECCIÓN O USAR TEXTO POR DEFECTO
      const descripcionRubrica = rubrica.secciones?.[0]?.descripcion || 
                                `Rúbrica de evaluación para el concurso "${nombreConcurso}"`;

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const descLines = doc.splitTextToSize(descripcionRubrica, 170);
      doc.text(descLines, 105, 38, { align: 'center' });

      let yPos = 48;

      // ==========================================
      // 2. INFORMACIÓN GENERAL
      // ==========================================
      doc.setFontSize(11);
      doc.setTextColor(0, 27, 76);
      doc.text('INFORMACIÓN GENERAL', 14, yPos);
      yPos += 6;

      // ✅ CALCULAR PUNTAJE MÁXIMO DESDE LOS NIVELES
      const puntajeMaximo = rubrica.niveles?.reduce((max, n) => Math.max(max, n.puntaje), 0) || 100;

      const infoData = [
        ['Rúbrica ID', `#${rubrica.concursoId}`],
        ['Concurso', nombreConcurso],
        ['Total Secciones', `${rubrica.secciones?.length || 0}`],
        ['Total Criterios', `${this.totalCriterios(rubrica)}`],
        ['Total Niveles', `${rubrica.niveles?.length || 0}`],
        ['Puntaje Máximo', `${puntajeMaximo} pts`]
      ];

      autoTable(doc, {
        startY: yPos,
        head: [['Campo', 'Valor']],
        body: infoData,
        theme: 'plain',
        headStyles: {
          fillColor: [0, 27, 76],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: 'bold' },
          1: { cellWidth: 100 }
        },
        margin: { left: 14, right: 14 },
        tableWidth: 170
      });

      yPos = (doc as any).lastAutoTable.finalY + 8;

      // ==========================================
      // 3. NIVELES DE DESEMPEÑO
      // ==========================================
      doc.setFontSize(12);
      doc.setTextColor(0, 27, 76);
      doc.text('NIVELES DE DESEMPEÑO', 14, yPos);
      yPos += 6;

      if (rubrica.niveles && rubrica.niveles.length > 0) {
        // Ordenar niveles por puntaje (ascendente)
        const nivelesOrdenados = [...rubrica.niveles].sort((a, b) => a.puntaje - b.puntaje);

        const nivelesData = nivelesOrdenados.map(n => [
          n.nombre,
          `${n.puntaje} pts`,
          n.descripcion || '—'
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Nivel', 'Puntaje', 'Descripción']],
          body: nivelesData,
          theme: 'grid',
          headStyles: {
            fillColor: [201, 168, 76],
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold'
          },
          bodyStyles: { fontSize: 9 },
          columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 25, halign: 'center' },
            2: { cellWidth: 110 }
          },
          margin: { left: 14, right: 14 },
          tableWidth: 170
        });

        yPos = (doc as any).lastAutoTable.finalY + 8;
      } else {
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('No hay niveles configurados', 14, yPos + 4);
        yPos += 10;
      }

      // ==========================================
      // 4. SECCIONES Y CRITERIOS (PARTE PRINCIPAL)
      // ==========================================
      if (rubrica.secciones && rubrica.secciones.length > 0) {
        doc.addPage();

        doc.setFontSize(16);
        doc.setTextColor(0, 27, 76);
        doc.text('SECCIONES Y CRITERIOS', 105, 20, { align: 'center' });

        let ySection = 30;

        rubrica.secciones.forEach((seccion, idx) => {
          // Verificar si necesitamos nueva página
          if (ySection > 250) {
            doc.addPage();
            ySection = 20;
          }

          // Título de sección con fondo
          const sectionTitle = `${idx + 1}. ${seccion.nombre}`;
          doc.setFontSize(13);
          doc.setTextColor(255, 255, 255);
          doc.setFillColor(0, 27, 76);
          doc.rect(14, ySection - 2, 182, 8, 'F');
          doc.text(sectionTitle, 18, ySection + 4);

          ySection += 10;

          if (seccion.descripcion) {
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            const descLines2 = doc.splitTextToSize(`📝 ${seccion.descripcion}`, 170);
            doc.text(descLines2, 18, ySection);
            ySection += (descLines2.length * 4.5) + 3;
          }

          // Criterios de la sección
          if (seccion.criterios && seccion.criterios.length > 0) {
            const criteriosData = seccion.criterios.map((c, cIdx) => [
              `${cIdx + 1}`,
              c.texto,
              '☐',  // Checkbox vacío
              '☐',  // Checkbox vacío
              '☐'   // Checkbox vacío
            ]);

            autoTable(doc, {
              startY: ySection,
              head: [['#', 'Criterio', 'Regular', 'Mediano', 'Completo']],
              body: criteriosData,
              theme: 'grid',
              headStyles: {
                fillColor: [201, 168, 76],
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: 'bold'
              },
              bodyStyles: { fontSize: 8.5 },
              columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: 110 },
                2: { cellWidth: 18, halign: 'center' },
                3: { cellWidth: 18, halign: 'center' },
                4: { cellWidth: 18, halign: 'center' }
              },
              margin: { left: 14, right: 14 },
              tableWidth: 182
            });

            ySection = (doc as any).lastAutoTable.finalY + 4;

            // Espacio para observaciones
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text('Observaciones:', 18, ySection);
            doc.setDrawColor(200, 200, 200);
            doc.line(18, ySection + 2, 190, ySection + 2);
            ySection += 10;

          } else {
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text('(Sin criterios definidos)', 18, ySection);
            ySection += 6;
          }

          // Espacio entre secciones
          ySection += 6;
        });

      } else {
        doc.setFontSize(11);
        doc.setTextColor(150, 150, 150);
        doc.text('No hay secciones configuradas en esta rúbrica', 105, 80, { align: 'center' });
      }

      // ==========================================
      // 5. PIE DE PÁGINA
      // ==========================================
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(180, 180, 180);
        doc.text(
          `Rúbrica #${rubrica.concursoId} - Generado: ${new Date().toLocaleDateString('es-EC')}`,
          105,
          287,
          { align: 'center' }
        );
        doc.text(`Página ${i} de ${totalPages}`, 195, 287, { align: 'right' });
      }

      // ==========================================
      // 6. DESCARGAR PDF
      // ==========================================
      const nombreArchivo = `rubrica-concurso-${rubrica.concursoId}-${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(nombreArchivo);

      this.descargando = false;
      console.log(`✅ Rúbrica exportada correctamente: ${nombreArchivo}`);

    } catch (error) {
      console.error('❌ Error generando la rúbrica:', error);
      this.descargando = false;
      alert('Error al generar el PDF de la rúbrica. Por favor, intenta de nuevo.');
    }
  }

  // ==========================================================
  // MÉTODOS EXISTENTES
  // ==========================================================

  exportarRubrica(rubrica: RubricaConcurso): void {
    console.log('📤 Exportando rúbrica (Excel):', rubrica);

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
          mensaje = 'La funcionalidad de exportación Excel está en desarrollo.\n\n' +
                    'Usa el botón "Descargar rúbrica" para obtener el PDF estructurado.';
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

  // ========== MODAL DEL BUILDER ==========
  abrirBuilder(rubrica: RubricaConcurso): void {
    this.cerrarModalYLuego(() => {
      const concurso = this.concursosDisponibles.find(c => c.id === rubrica.concursoId);
      this.concursoSeleccionadoBuilder = rubrica.concursoId;
      this.concursoNombreBuilder = concurso?.nombre || `Concurso #${rubrica.concursoId}`;
      this.builderAbierto = true;
    });
  }

  cerrarBuilder(): void {
    this.builderAbierto = false;
    this.concursoSeleccionadoBuilder = null;
    setTimeout(() => {
      this.cargarRubricas();
    }, 300);
  }
}
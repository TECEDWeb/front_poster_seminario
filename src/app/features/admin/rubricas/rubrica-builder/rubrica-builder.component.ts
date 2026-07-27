import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonContent, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, 
  createOutline, 
  trashOutline, 
  checkmarkOutline, 
  closeOutline,
  chevronDownOutline, 
  chevronForwardOutline, 
  layersOutline, 
  listOutline,
  starOutline, 
  alertCircleOutline, 
  optionsOutline, 
  saveOutline,
  informationCircleOutline,
  refreshOutline,
  checkboxOutline,
  eyeOutline,
  downloadOutline,
  filterOutline,
  trophyOutline,
  pricetagOutline,
  documentTextOutline,
  searchOutline,
  funnelOutline,
  printOutline,
  arrowBackOutline
} from 'ionicons/icons';

import { SeccionService } from '../../../../core/services/seccion.service';
import { CriterioService } from 'src/app/core/services/cirterio.service';
import { NivelService } from '../../../../core/services/nivel.service';
import { Seccion, Criterio, Nivel } from '../../../../core/models/rubrica.model';

// Interfaces extendidas con propiedades UI
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
    IonContent, IonSpinner
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

  // Estado para descarga
  descargando = false;

  constructor(
    private seccionService: SeccionService,
    private criterioService: CriterioService,
    private nivelService: NivelService
  ) {
    addIcons({
      addOutline, 
      createOutline, 
      trashOutline, 
      checkmarkOutline, 
      closeOutline,
      chevronDownOutline, 
      chevronForwardOutline, 
      layersOutline, 
      listOutline,
      starOutline, 
      alertCircleOutline, 
      optionsOutline, 
      saveOutline,
      informationCircleOutline,
      refreshOutline,
      checkboxOutline,
      eyeOutline,
      downloadOutline,
      filterOutline,
      trophyOutline,
      pricetagOutline,
      documentTextOutline,
      searchOutline,
      funnelOutline,
      printOutline,
      arrowBackOutline
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

    // Cargar secciones
    this.seccionService.listarPorConcurso(this.concursoId).subscribe({
      next: (secciones) => {
        this.secciones = secciones.map(s => ({ 
          ...s, 
          criterios: [], 
          expandida: true,
          cargandoCriterios: false,
          agregandoCriterio: false,
          nuevoCriterioTexto: ''
        }));
        this.secciones.forEach(s => this.cargarCriterios(s));
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al cargar las secciones';
        this.cargando = false;
      }
    });

    // Cargar niveles globales
    this.nivelService.listarGlobales(this.concursoId).subscribe({
      next: (niveles) => {
        this.nivelesGlobales = niveles.map(n => ({ ...n }));
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
        seccion.criterios = criterios.map(c => ({ 
          ...c,
          mostrarNiveles: false,
          cargandoNiveles: false,
          agregandoNivel: false,
          nivelesPersonalizados: [],
          nuevoNivel: { nombre: '', puntaje: null, descripcion: '' }
        }));
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
        const nuevaSeccion: SeccionUI = {
          ...seccion,
          criterios: [],
          expandida: true,
          cargandoCriterios: false,
          agregandoCriterio: false,
          nuevoCriterioTexto: ''
        };
        this.secciones.push(nuevaSeccion);
        this.agregandoSeccion = false;
        this.cargarCriterios(nuevaSeccion);
      },
      error: (err) => {
        alert(err.error?.mensaje || 'Error al crear la sección');
      }
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
        const nuevoCriterio: CriterioUI = {
          ...criterio,
          mostrarNiveles: false,
          cargandoNiveles: false,
          agregandoNivel: false,
          nivelesPersonalizados: [],
          nuevoNivel: { nombre: '', puntaje: null, descripcion: '' }
        };
        seccion.criterios.push(nuevoCriterio);
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

    if (criterio.mostrarNiveles && !criterio.nivelesPersonalizados?.length) {
      criterio.cargandoNiveles = true;
      this.nivelService.listarPorCriterio(criterio.id).subscribe({
        next: (niveles) => {
          criterio.nivelesPersonalizados = niveles.map(n => ({ ...n }));
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
        if (!criterio.nivelesPersonalizados) {
          criterio.nivelesPersonalizados = [];
        }
        criterio.nivelesPersonalizados.push({ ...nivel });
        criterio.agregandoNivel = false;
        criterio.nuevoNivel = { nombre: '', puntaje: null, descripcion: '' };
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
        this.nivelesGlobales.push({ ...nivel });
        this.agregandoNivelGlobal = false;
        this.nuevoNivelGlobal = { nombre: '', puntaje: null, descripcion: '' };
      },
      error: (err) => alert(err.error?.mensaje || 'Error al crear el nivel')
    });
  }

  // MÉTODO: DESCARGAR RÚBRICA EN PDF - FORMATO MANUAL
  async descargarRubricaPDF(): Promise<void> {
    if (this.descargando) return;
    
    this.descargando = true;

    try {
      const { default: jsPDF } = await import('jspdf');
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.default;

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageWidth = 297;
      const pageHeight = 210;
      const margin = 14;
      const contentWidth = pageWidth - (margin * 2);

      let yPos = 16;

      // ==========================================================
      // 1. ENCABEZADO
      // ==========================================================
      doc.setFillColor(0, 27, 76);
      doc.rect(0, 0, pageWidth, 5, 'F');

      doc.setFontSize(16);
      doc.setTextColor(0, 27, 76);
      doc.setFont('helvetica', 'bold');
      doc.text('FORMULARIO DE EVALUACIÓN', pageWidth / 2, 18, { align: 'center' });

      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.text(this.concursoNombre || `CONCURSO #${this.concursoId}`, pageWidth / 2, 25, { align: 'center' });

      doc.setDrawColor(201, 168, 76);
      doc.setLineWidth(0.5);
      doc.line(margin + 30, 28, pageWidth - margin - 30, 28);

      yPos = 33;

      // ==========================================================
      // 2. DATOS DEL PROYECTO
      // ==========================================================
      doc.setFontSize(9);
      doc.setTextColor(0, 27, 76);
      doc.setFont('helvetica', 'bold');
      doc.text('DATOS DEL PROYECTO', margin, yPos);
      yPos += 2;

      const datosGenerales = [
        ['Proyecto:', '___________________________________________'],
        ['Expositor(a):', '___________________________________________'],
        ['Evaluador(a):', '___________________________________________'],
        ['Fecha:', '___________________________________________']
      ];

      autoTable(doc, {
        startY: yPos + 1,
        body: datosGenerales,
        theme: 'plain',
        styles: {
          fontSize: 9,
          cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 2 },
          valign: 'middle'
        },
        columnStyles: {
          0: { cellWidth: 30, fontStyle: 'bold', textColor: [60, 60, 60] },
          1: { cellWidth: contentWidth - 30 }
        },
        margin: { left: margin, right: margin },
        tableWidth: contentWidth
      });

      yPos = (doc as any).lastAutoTable.finalY + 4;

      // ==========================================================
      // 3. NIVELES DE EVALUACIÓN - TODOS LOS NIVELES
      // ==========================================================
      doc.setFontSize(9);
      doc.setTextColor(0, 27, 76);
      doc.setFont('helvetica', 'bold');
      doc.text('NIVELES DE EVALUACIÓN', margin, yPos);
      yPos += 2;

      // Obtener TODOS los niveles
      let niveles: any[] = [];
      
      if (this.nivelesGlobales && this.nivelesGlobales.length > 0) {
        niveles = this.nivelesGlobales.map(n => ({
          nombre: n.nombre,
          puntaje: n.puntaje
        }));
      } else {
        // Niveles por defecto
        niveles = [
          { nombre: 'Nivel 1', puntaje: 1 },
          { nombre: 'Nivel 2', puntaje: 2 },
          { nombre: 'Nivel 3', puntaje: 3 },
          { nombre: 'Nivel 4', puntaje: 4 },
          { nombre: 'Nivel 5', puntaje: 5 }
        ];
      }

      // Ordenar por puntaje
      niveles.sort((a, b) => a.puntaje - b.puntaje);

      // Crear tabla de niveles - usar autoTable
      const nivelHeaders = niveles.map((n, i) => `Nivel ${i + 1}`);
      const nivelFila = niveles.map(n => n.nombre);

      autoTable(doc, {
        startY: yPos + 1,
        head: [nivelHeaders],
        body: [nivelFila],
        theme: 'grid',
        headStyles: {
          fillColor: [235, 245, 251],
          textColor: [0, 27, 76],
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 7.5,
          halign: 'center',
          valign: 'middle'
        },
        styles: {
          cellPadding: { top: 2, bottom: 2, left: 2, right: 2 }
        },
        margin: { left: margin, right: margin },
        tableWidth: contentWidth
      });

      yPos = (doc as any).lastAutoTable.finalY + 5;

      // ==========================================================
      // 4. SECCIONES Y CRITERIOS - CON TABLA CORRECTA
      // ==========================================================
      if (this.secciones && this.secciones.length > 0) {
        let seccionIndex = 0;
        
        for (const seccion of this.secciones) {
          // Verificar espacio en página
          if (yPos > 170) {
            doc.addPage();
            yPos = 16;
          }

          seccionIndex++;

          // ==========================================================
          // 4a. ENCABEZADO DE SECCIÓN
          // ==========================================================
          doc.setFillColor(0, 27, 76);
          doc.rect(margin, yPos - 1, contentWidth, 7, 'F');
          doc.setFontSize(10);
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.text(`${seccionIndex}. ${seccion.nombre.toUpperCase()}`, margin + 4, yPos + 4.5);

          yPos += 9;

          // ==========================================================
          // 4b. TABLA DE CRITERIOS
          // ==========================================================
          const criterios = seccion.criterios || [];
          
          if (criterios.length > 0) {
            // Nombres de niveles (cortos)
            const nivelesNombres = niveles.map((n, i) => `Nivel ${i + 1}`);

            // Calcular anchos
            const numNiveles = niveles.length;
            const anchoCasilla = 10;
            const anchoCriterio = contentWidth - 12 - (anchoCasilla * numNiveles);
            
            // Construir datos de la tabla
            const criteriosData: any[][] = [];
            
            criterios.forEach((c, idx) => {
              const fila = [`${idx + 1}. ${c.texto}`];
              // Agregar una casilla vacía por cada nivel
              for (let i = 0; i < numNiveles; i++) {
                fila.push('');
              }
              criteriosData.push(fila);
            });

            // Construir encabezados
            const headers = ['Criterio', ...nivelesNombres];

            autoTable(doc, {
              startY: yPos,
              head: [headers],
              body: criteriosData,
              theme: 'grid',
              headStyles: {
                fillColor: [201, 168, 76],
                textColor: [255, 255, 255],
                fontSize: 7,
                fontStyle: 'bold',
                halign: 'center'
              },
              bodyStyles: {
                fontSize: 7.5,
                valign: 'middle'
              },
              columnStyles: {
                0: { cellWidth: anchoCriterio, halign: 'left' }
              },
              // Todas las columnas de niveles con el mismo ancho
              margin: { left: margin, right: margin },
              tableWidth: contentWidth
            });

            yPos = (doc as any).lastAutoTable.finalY + 2;

            // ==========================================================
            // 4c. OBSERVACIONES
            // ==========================================================
            doc.setFontSize(8);
            doc.setTextColor(80, 80, 80);
            doc.setFont('helvetica', 'bold');
            doc.text('Observaciones:', margin + 2, yPos + 3);
            
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            doc.line(margin + 28, yPos + 3, pageWidth - margin - 2, yPos + 3);
            
            yPos += 6;
            doc.line(margin + 2, yPos + 3, pageWidth - margin - 2, yPos + 3);
            
            yPos += 10;

          } else {
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.setFont('helvetica', 'italic');
            doc.text('(Sin criterios definidos)', margin + 4, yPos);
            yPos += 8;
          }

          yPos += 2;
        }

      } else {
        doc.setFontSize(11);
        doc.setTextColor(150, 150, 150);
        doc.text('No hay secciones configuradas en esta rúbrica', pageWidth / 2, 100, { align: 'center' });
      }

      // ==========================================================
      // 5. RESULTADOS
      // ==========================================================
      if (yPos > 165) {
        doc.addPage();
        yPos = 16;
      }

      yPos += 3;
      doc.setDrawColor(0, 27, 76);
      doc.setLineWidth(0.4);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 6;

      doc.setFontSize(10);
      doc.setTextColor(0, 27, 76);
      doc.setFont('helvetica', 'bold');
      doc.text('RESULTADOS', margin, yPos);
      yPos += 5;

      const resultadosData = [
        ['Puntaje total obtenido:', '______ / ______'],
        ['% de cumplimiento:', '______ %']
      ];

      autoTable(doc, {
        startY: yPos,
        body: resultadosData,
        theme: 'plain',
        styles: {
          fontSize: 9,
          cellPadding: { top: 3, bottom: 3, left: 2, right: 2 },
          valign: 'middle'
        },
        columnStyles: {
          0: { cellWidth: 45, fontStyle: 'bold', textColor: [60, 60, 60] },
          1: { cellWidth: contentWidth - 45, halign: 'center' }
        },
        margin: { left: margin, right: margin },
        tableWidth: contentWidth
      });

      yPos = (doc as any).lastAutoTable.finalY + 8;

      // ==========================================================
      // 6. FIRMAS
      // ==========================================================
      const firmaY = yPos;
      const firmaAncho = (contentWidth - 20) / 2;

      doc.line(margin, firmaY, margin + firmaAncho, firmaY);
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.text('Firma del/la evaluador(a)', margin + (firmaAncho / 2), firmaY + 5, { align: 'center' });

      doc.line(margin + firmaAncho + 20, firmaY, margin + firmaAncho + 20 + firmaAncho, firmaY);
      doc.text('Firma del/la expositor(a)', margin + firmaAncho + 20 + (firmaAncho / 2), firmaY + 5, { align: 'center' });

      yPos = firmaY + 14;

      // ==========================================================
      // 7. FOOTER
      // ==========================================================
      doc.setDrawColor(0, 27, 76);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      doc.setFontSize(6);
      doc.setTextColor(180, 180, 180);
      doc.setFont('helvetica', 'italic');
      const fecha = new Date().toLocaleDateString('es-EC', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      doc.text(`Rúbrica #${this.concursoId} - ${this.concursoNombre || ''} - ${fecha}`, pageWidth / 2, pageHeight - 7, { align: 'center' });

      // ==========================================================
      // 8. GUARDAR
      // ==========================================================
      const nombreArchivo = `formulario-evaluacion-${this.concursoId}-${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(nombreArchivo);

      this.descargando = false;
      console.log(`✅ Formulario de evaluación exportado: ${nombreArchivo}`);

    } catch (error) {
      console.error('❌ Error generando el formulario:', error);
      this.descargando = false;
      alert('Error al generar el PDF del formulario. Por favor, intenta de nuevo.');
    }
  }
  cerrarModal(): void {
    this.cerrar.emit();
  }

  trackById(index: number, item: any): number {
    return item?.id ?? index;
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonButton,
  IonRadioGroup,
  IonRadio,
  IonItem,
  IonLabel,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonIcon,
  IonSpinner,
  IonTextarea
} from '@ionic/angular/standalone';

import { EvaluacionService } from '../../../core/services/evaluacion.service';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  checkmarkCircleOutline,
  timeOutline,
  alertCircleOutline,
  refreshOutline,
  closeOutline,
  checkmarkOutline,
  chatbubbleOutline,
  documentOutline,
  folderOutline,
  checkboxOutline,
  trophyOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-formulario-evaluacion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonRadioGroup,
    IonRadio,
    IonItem,
    IonLabel,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonIcon,
    IonSpinner,
    IonTextarea
  ],
  templateUrl: './formulario-evaluacion.page.html',
  styleUrls: ['./formulario-evaluacion.page.scss']
})
export class FormularioEvaluacionPage implements OnInit {

  evaluacionId!: number;
  formulario: any = null;
  respuestas: { [criterioId: number]: number } = {};
  observacion: string = '';
  cargando: boolean = false;
  guardando: boolean = false;
  error: string | null = null;
  proyectoNombre: string = '';
  concursoNombre: string = '';
  today: Date = new Date();

  totalCriterios: number = 0;
  criteriosRespondidos: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private evaluacionService: EvaluacionService
  ) {
    addIcons({
      arrowBackOutline,
      checkmarkCircleOutline,
      timeOutline,
      alertCircleOutline,
      refreshOutline,
      closeOutline,
      checkmarkOutline,
      chatbubbleOutline,
      documentOutline,
      folderOutline,
      checkboxOutline,
      trophyOutline
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      console.error('❌ No existe ID evaluación');
      this.error = 'No se encontró el ID de la evaluación';
      return;
    }
    this.evaluacionId = Number(id);
    console.log('🟢 Evaluación cargada:', this.evaluacionId);
    this.cargarFormulario();
  }

  cargarFormulario(): void {
    this.cargando = true;
    this.error = null;

    this.evaluacionService.getFormulario(this.evaluacionId).subscribe({
      next: (res: any) => {
        console.log('================================');
        console.log('🟢 RESPUESTA BACKEND COMPLETA', JSON.stringify(res, null, 2));
        console.log('================================');

        if (res?.ok === false) {
          console.error('❌ Backend error', res.mensaje);
          this.error = res.mensaje || 'Error al cargar el formulario';
          this.formulario = null;
          this.cargando = false;
          return;
        }

        let data = res?.data?.data || res?.data || res || {};

        console.log('📦 DATA extraída:', data);
        console.log('📦 DATA keys:', Object.keys(data));
        console.log('📦 DATA secciones:', data.secciones);
        console.log('📦 DATA rubrica:', data.rubrica);

        if (data && data.secciones && data.rubrica) {
          this.formulario = data;

          if (data.proyecto) {
            this.proyectoNombre = data.proyecto.nombre || 'Proyecto sin nombre';
          }
          if (data.concurso) {
            this.concursoNombre = data.concurso.nombre || '';
          }

          this.totalCriterios = data.secciones?.reduce(
            (total: number, seccion: any) => total + (seccion.criterios?.length || 0),
            0
          ) || 0;

          console.log('🟢 FORMULARIO CARGADO', this.formulario);
          console.log('🟢 SECCIONES:', data.secciones?.length);
          console.log('🟢 TOTAL CRITERIOS:', this.totalCriterios);
          console.log('🟢 RÚBRICA:', data.rubrica);

          this.verificarNiveles();

        } else {
          console.error('❌ Estructura de datos incorrecta', data);

          if (data.data && data.data.secciones) {
            this.formulario = data.data;
            this.totalCriterios = data.data.secciones?.reduce(
              (total: number, seccion: any) => total + (seccion.criterios?.length || 0),
              0
            ) || 0;
            console.log('🟢 Usando data.data como formulario');
            this.verificarNiveles();
          } else {
            this.error = 'El formulario no tiene la estructura esperada';
            this.formulario = null;
          }
        }

        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ ERROR HTTP', err);
        this.error = err.error?.mensaje || 'Error al cargar el formulario';
        this.formulario = null;
        this.cargando = false;
      }
    });
  }

  verificarNiveles(): void {
    if (this.formulario && this.formulario.secciones) {
      let criteriosSinNiveles = 0;
      this.formulario.secciones.forEach((seccion: any, idx: number) => {
        console.log(`📋 Sección ${idx + 1}: ${seccion.nombre}`);
        if (seccion.criterios) {
          seccion.criterios.forEach((criterio: any, cIdx: number) => {
            console.log(`  ✏️ Criterio ${cIdx + 1}: ${criterio.texto}`);
            console.log(`    📊 Niveles:`, criterio.niveles);
            if (!criterio.niveles || criterio.niveles.length === 0) {
              console.warn(`⚠️ El criterio ${cIdx + 1} no tiene niveles`);
              criteriosSinNiveles++;
            }
          });
        }
      });
      if (criteriosSinNiveles > 0) {
        console.warn(`⚠️ Total de criterios sin niveles: ${criteriosSinNiveles}`);
      }
    }
  }

  seleccionar(criterioId: number, nivelId: number): void {
    console.log('Respuesta seleccionada', { criterioId, nivelId });

    if (this.respuestas[criterioId] !== undefined) {
      if (this.respuestas[criterioId] === nivelId) {
        delete this.respuestas[criterioId];
        console.log('🗑️ Respuesta removida para criterio:', criterioId);
      } else {
        this.respuestas[criterioId] = nivelId;
        console.log('🔄 Respuesta cambiada para criterio:', criterioId);
      }
    } else {
      this.respuestas[criterioId] = nivelId;
      console.log('✅ Nueva respuesta para criterio:', criterioId);
    }

    this.actualizarProgreso();
    console.log('📊 Criterios respondidos:', this.criteriosRespondidos);
    console.log('📊 Total criterios:', this.totalCriterios);
    console.log('📊 Porcentaje:', this.getPorcentajeProgreso());
  }

  actualizarProgreso(): void {
    this.criteriosRespondidos = Object.keys(this.respuestas).length;
    console.log('🔄 Progreso actualizado:', this.criteriosRespondidos);
  }

  getPorcentajeProgreso(): number {
    if (this.totalCriterios === 0) return 0;
    const porcentaje = Math.round((this.criteriosRespondidos / this.totalCriterios) * 100);
    return Math.min(porcentaje, 100);
  }

  getPuntajeTotal(): number {
    let total = 0;
    Object.keys(this.respuestas).forEach(criterioId => {
      const nivelId = this.respuestas[Number(criterioId)];
      this.formulario?.secciones?.forEach((seccion: any) => {
        seccion.criterios?.forEach((criterio: any) => {
          if (criterio.id === Number(criterioId)) {
            const nivel = criterio.niveles?.find((n: any) => n.id === nivelId);
            if (nivel) {
              total += nivel.puntaje || 0;
            }
          }
        });
      });
    });
    return total;
  }

  getPuntajeMaximo(): number {
    let maximo = 0;
    this.formulario?.secciones?.forEach((seccion: any) => {
      seccion.criterios?.forEach((criterio: any) => {
        const maxNivel = criterio.niveles?.reduce((max: any, n: any) => {
          return (n.puntaje || 0) > (max?.puntaje || 0) ? n : max;
        }, null);
        if (maxNivel) {
          maximo += maxNivel.puntaje || 0;
        }
      });
    });
    return maximo;
  }

  getPorcentajeSeccion(seccion: any): number {
    if (!seccion?.criterios?.length) return 0;

    let respondidos = 0;
    let total = seccion.criterios.length;

    seccion.criterios.forEach((criterio: any) => {
      if (this.respuestas[criterio.id] !== undefined) {
        respondidos++;
      }
    });

    return Math.round((respondidos / total) * 100);
  }

  estaRespondido(criterioId: number): boolean {
    return this.respuestas[criterioId] !== undefined;
  }

  getNivelSeleccionado(criterioId: number): number | undefined {
    return this.respuestas[criterioId];
  }

  guardar(): void {
    const detalles = Object.keys(this.respuestas).map(id => ({
      criterio_id: Number(id),
      nivel_id: this.respuestas[Number(id)]
    }));

    if (detalles.length === 0) {
      this.mostrarMensaje('Debe seleccionar al menos una respuesta', 'error');
      return;
    }

    if (!confirm('¿Estás seguro de guardar la evaluación?')) {
      return;
    }

    this.guardando = true;
    const payload = {
      observacion: this.observacion || '',
      detalles: detalles
    };

    console.log('📤 ENVIANDO PAYLOAD:', JSON.stringify(payload, null, 2));

    this.evaluacionService.guardar(this.evaluacionId, payload).subscribe({
      next: (res) => {
        console.log('✅ GUARDADO EXITOSO:', res);
        this.guardando = false;
        this.mostrarMensaje('Evaluación guardada correctamente', 'success');
        this.router.navigate(['/evaluador/proyectos-asignados']);
      },
      error: (err) => {
        console.error('❌ ERROR GUARDANDO:', err);
        console.error('❌ Detalles del error:', err.error);
        this.guardando = false;

        let mensaje = err.error?.mensaje || 'Error al guardar la evaluación';
        if (err.status === 0) {
          mensaje = 'Error de conexión. Verifica tu conexión a internet.';
        } else if (err.status === 401) {
          mensaje = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
        } else if (err.status === 403) {
          mensaje = 'No tienes permisos para realizar esta acción.';
        } else if (err.status === 404) {
          mensaje = 'La evaluación no existe o ya fue completada.';
        }
        this.mostrarMensaje(mensaje, 'error');
      }
    });
  }

  volver(): void {
    const respuestasCount = Object.keys(this.respuestas).length;
    if (respuestasCount > 0) {
      if (!confirm('¿Estás seguro de salir? Los cambios no guardados se perderán.')) {
        return;
      }
    }
    this.router.navigate(['/evaluador/proyectos-asignados']);
  }

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error'): void {
    const icono = tipo === 'success' ? '✅' : '❌';
    alert(`${icono} ${mensaje}`);
  }

  debugEstado(): void {
    console.log('🔍 DEBUG ESTADO:');
    console.log('  - Evaluación ID:', this.evaluacionId);
    console.log('  - Total criterios:', this.totalCriterios);
    console.log('  - Criterios respondidos:', this.criteriosRespondidos);
    console.log('  - Respuestas:', this.respuestas);
    console.log('  - Formulario:', this.formulario);
    console.log('  - Proyecto:', this.proyectoNombre);
    console.log('  - Concurso:', this.concursoNombre);
  }

  tieneRespuestasIncompletas(): boolean {
    if (!this.formulario) return false;
    let total = 0;
    let respondidas = 0;
    this.formulario.secciones?.forEach((seccion: any) => {
      seccion.criterios?.forEach((criterio: any) => {
        total++;
        if (this.respuestas[criterio.id] !== undefined) {
          respondidas++;
        }
      });
    });
    return respondidas > 0 && respondidas < total;
  }

  getResumenRespuestas(): string {
    if (this.criteriosRespondidos === 0) return 'Sin respuestas';
    if (this.criteriosRespondidos === this.totalCriterios) return 'Completo';
    return `${this.criteriosRespondidos} de ${this.totalCriterios}`;
  }
}
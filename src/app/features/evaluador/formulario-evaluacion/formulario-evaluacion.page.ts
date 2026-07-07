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
  IonSpinner
} from '@ionic/angular/standalone';

import { HeaderComponent } from '../../../shared/components/header/header.component';
import { EvaluacionService } from '../../../core/services/evaluacion.service';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  checkmarkCircleOutline,
  timeOutline,
  alertCircleOutline
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
    HeaderComponent
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
  evaluadorNombre: string = '';

  // Estadísticas de progreso
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
      alertCircleOutline
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
        console.log('🟢 RESPUESTA BACKEND', res);

        if (res?.ok === false) {
          console.error('❌ Backend error', res.mensaje);
          this.error = res.mensaje || 'Error al cargar el formulario';
          this.formulario = null;
        } else {
          // Normalizar respuesta
          this.formulario = res?.data?.data ?? res?.data ?? res;
          
          // Extraer información del proyecto
          if (this.formulario?.proyecto) {
            this.proyectoNombre = this.formulario.proyecto.nombre || 'Proyecto sin nombre';
          }

          // Contar criterios totales
          this.totalCriterios = this.formulario?.secciones?.reduce(
            (total: number, seccion: any) => total + (seccion.criterios?.length || 0),
            0
          ) || 0;

          console.log('🟢 FORMULARIO CARGADO', this.formulario);
          console.log('🟢 SECCIONES:', this.formulario?.secciones?.length);
          console.log('🟢 TOTAL CRITERIOS:', this.totalCriterios);
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

  seleccionar(criterioId: number, nivelId: number): void {
    console.log('Respuesta seleccionada', { criterioId, nivelId });
    
    // Si ya había una respuesta seleccionada, actualizar
    if (this.respuestas[criterioId] !== undefined) {
      // Si es el mismo nivel, deseleccionar (toggle)
      if (this.respuestas[criterioId] === nivelId) {
        delete this.respuestas[criterioId];
      } else {
        this.respuestas[criterioId] = nivelId;
      }
    } else {
      this.respuestas[criterioId] = nivelId;
    }

    // Actualizar contador
    this.actualizarProgreso();
  }

  actualizarProgreso(): void {
    this.criteriosRespondidos = Object.keys(this.respuestas).length;
  }

  getPorcentajeProgreso(): number {
    if (this.totalCriterios === 0) return 0;
    return Math.round((this.criteriosRespondidos / this.totalCriterios) * 100);
  }

  getPuntajeTotal(): number {
    let total = 0;
    // Recorrer todas las respuestas y sumar los puntajes
    Object.keys(this.respuestas).forEach(criterioId => {
      const nivelId = this.respuestas[Number(criterioId)];
      // Buscar el nivel en el formulario
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

  guardar(): void {
    const detalles = Object.keys(this.respuestas).map(id => ({
      criterio_id: Number(id),
      nivel_id: this.respuestas[Number(id)]
    }));

    if (detalles.length === 0) {
      alert('Debe seleccionar al menos una respuesta');
      return;
    }

    // Confirmar antes de guardar
    if (!confirm('¿Estás seguro de guardar la evaluación?')) {
      return;
    }

    this.guardando = true;
    const payload = {
      observacion: this.observacion,
      detalles
    };

    console.log('📤 ENVIANDO', payload);

    this.evaluacionService.guardar(this.evaluacionId, payload).subscribe({
      next: (res) => {
        console.log('✅ GUARDADO', res);
        this.guardando = false;
        alert('✅ Evaluación guardada correctamente');
        this.router.navigate(['/evaluador/proyectos-asignados']);
      },
      error: (err) => {
        console.error('❌ ERROR GUARDANDO', err);
        this.guardando = false;
        alert('❌ Error al guardar la evaluación: ' + (err.error?.mensaje || 'Error desconocido'));
      }
    });
  }

  volver(): void {
    if (Object.keys(this.respuestas).length > 0) {
      if (!confirm('¿Estás seguro de salir? Los cambios no guardados se perderán.')) {
        return;
      }
    }
    this.router.navigate(['/evaluador/proyectos-asignados']);
  }

  estaRespondido(criterioId: number): boolean {
    return this.respuestas[criterioId] !== undefined;
  }

  getNivelSeleccionado(criterioId: number): number | undefined {
    return this.respuestas[criterioId];
  }
  // formulario-evaluacion.page.ts
// Añadir este método

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
}
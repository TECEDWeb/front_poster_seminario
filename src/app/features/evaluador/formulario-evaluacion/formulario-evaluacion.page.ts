import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonButton,
  IonRadioGroup,
  IonRadio,
  IonItem,
  IonLabel
} from '@ionic/angular/standalone';

import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { EvaluacionService } from 'src/app/core/services/evaluacion.service';

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
    HeaderComponent
  ],
  templateUrl: './formulario-evaluacion.page.html',
  styleUrls: ['./formulario-evaluacion.page.scss']
})
export class FormularioEvaluacionPage implements OnInit {

  evaluacionId!: number;

  formulario: any = null;

  respuestas: { [key: number]: number } = {};
  observacion: string = '';

  cargando = false;

  constructor(
    private route: ActivatedRoute,
    private evaluacionService: EvaluacionService
  ) {}

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      console.error('❌ No se recibió ID en la ruta');
      return;
    }

    this.evaluacionId = Number(id);

    if (isNaN(this.evaluacionId)) {
      console.error('❌ ID inválido:', id);
      return;
    }

    this.cargarFormulario();
  }

  cargarFormulario(): void {

    this.cargando = true;

    this.evaluacionService.getFormulario(this.evaluacionId)
      .subscribe({

        next: (res: any) => {

          this.formulario = res?.data ?? null;

          if (!this.formulario) {
            console.error('❌ Formulario no encontrado o vacío:', res);
          }

          this.cargando = false;
        },

        error: (err) => {

          console.error('❌ Error cargando formulario:', err);

          this.formulario = null;
          this.cargando = false;
        }

      });
  }

  seleccionar(criterioId: number, nivelId: number): void {
    this.respuestas[criterioId] = nivelId;
  }

  guardar(): void {

    const detalles = Object.keys(this.respuestas).map(id => ({
      criterio_id: Number(id),
      nivel_id: this.respuestas[+id]
    }));

    const payload = {
      observacion: this.observacion,
      detalles
    };

    this.evaluacionService.guardar(this.evaluacionId, payload)
      .subscribe({

        next: () => {
          alert('✅ Evaluación guardada correctamente');
        },

        error: (err) => {
          console.error('❌ Error guardando evaluación:', err);
          alert('Error al guardar evaluación');
        }

      });
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton, IonRadioGroup, IonRadio, IonItem, IonLabel } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { EvaluacionService } from 'src/app/core/services/evaluacion.service';
import { FormsModule } from '@angular/forms';

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

  respuestas: any = {};
  observacion: string = '';

  constructor(
    private route: ActivatedRoute,
    private evaluacionService: EvaluacionService
  ) {}

  ngOnInit() {
    this.evaluacionId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarFormulario();
  }

  cargarFormulario() {
    this.evaluacionService.getFormulario(this.evaluacionId)
      .subscribe(res => {
        this.formulario = res.data;
      });
  }

  seleccionar(criterioId: number, nivelId: number) {
    this.respuestas[criterioId] = nivelId;
  }

  guardar() {

    const detalles = Object.keys(this.respuestas).map(id => ({
      criterio_id: Number(id),
      nivel_id: this.respuestas[id]
    }));

    const payload = {
      observacion: this.observacion,
      detalles
    };

    this.evaluacionService.guardar(this.evaluacionId, payload)
      .subscribe(() => {
        alert('Evaluación guardada correctamente');
      });
  }
}
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

import { HeaderComponent } from '../../../shared/components/header/header.component';
import { EvaluacionService } from '../../../core/services/evaluacion.service';


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


  respuestas: {
    [criterioId: number]: number
  } = {};


  observacion = '';

  cargando = false;


  constructor(
    private route: ActivatedRoute,
    private evaluacionService: EvaluacionService
  ) {}


  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');


    if (!id) {

      console.error(
        '❌ No existe parámetro id en la ruta'
      );

      return;
    }


    this.evaluacionId = Number(id);


    if (Number.isNaN(this.evaluacionId)) {

      console.error(
        '❌ ID evaluación inválido:',
        id
      );

      return;
    }


    console.log(
      '🟢 Evaluación cargada:',
      this.evaluacionId
    );


    this.cargarFormulario();

  }



  cargarFormulario(): void {


    this.cargando = true;


    this.evaluacionService
      .getFormulario(this.evaluacionId)
      .subscribe({

        next: (res: any) => {


          console.log(
            '🟢 FORMULARIO RECIBIDO:',
            res
          );


          if (res?.ok === false) {

            console.error(
              '❌ Backend respondió error:',
              res.mensaje
            );

            this.formulario = null;

          } else {


            this.formulario =
              res?.data ?? null;


          }


          this.cargando = false;


        },


        error: (err) => {


          console.error(
            '❌ Error HTTP formulario:',
            err
          );


          this.formulario = null;

          this.cargando = false;


        }


      });

  }




  seleccionar(
    criterioId: number,
    nivelId: number
  ): void {


    console.log(
      'Respuesta:',
      criterioId,
      nivelId
    );


    this.respuestas[criterioId] = nivelId;

  }




  guardar(): void {



    const detalles =
      Object.keys(this.respuestas)
      .map(id => ({

        criterio_id: Number(id),

        nivel_id:
          this.respuestas[
            Number(id)
          ]

      }));



    if (detalles.length === 0) {


      alert(
        'Debe seleccionar al menos una respuesta'
      );


      return;

    }



    const payload = {

      observacion:
        this.observacion,

      detalles

    };



    console.log(
      '📤 ENVIANDO EVALUACIÓN:',
      payload
    );



    this.evaluacionService
      .guardar(
        this.evaluacionId,
        payload
      )
      .subscribe({


        next: (res) => {


          console.log(
            '✅ Guardado:',
            res
          );


          alert(
            'Evaluación guardada correctamente'
          );


        },


        error: (err) => {


          console.error(
            '❌ Error guardando:',
            err
          );


          alert(
            'Error al guardar evaluación'
          );


        }


      });


  }


}
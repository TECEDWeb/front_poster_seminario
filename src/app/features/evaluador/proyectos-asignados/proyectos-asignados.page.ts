import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonIcon,
  IonButton
} from '@ionic/angular/standalone';

import { Router } from '@angular/router';

import { addIcons } from 'ionicons';

import {
  documentTextOutline,
  peopleOutline,
  clipboardOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';


import { EvaluacionService } from '../../../core/services/evaluacion.service';

import { ProyectoAsignado } from '../../../core/models/proyecto.model';



@Component({
  selector: 'app-proyectos-asignados',
  standalone: true,

  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonIcon,
    IonButton
  ],

  templateUrl: './proyectos-asignados.page.html',
  styleUrls: ['./proyectos-asignados.page.scss']
})


export class ProyectosAsignadosPage implements OnInit {


  proyectos: ProyectoAsignado[] = [];



  constructor(

    private evaluacionService: EvaluacionService,

    private router: Router

  ) {


    addIcons({

      documentTextOutline,
      peopleOutline,
      clipboardOutline,
      checkmarkCircleOutline

    });


  }




  ngOnInit(): void {

    this.cargar();

  }





  cargar(): void {


    this.evaluacionService
      .getAsignados()
      .subscribe({

        next:(res:any)=>{


          console.log(
            '🟢 RESPUESTA ASIGNADOS:',
            res
          );



          this.proyectos =
            res?.data ?? [];



          console.log(
            '🟢 PROYECTOS FINAL:',
            this.proyectos
          );



        },


        error:(err)=>{


          console.error(
            '❌ ERROR CARGANDO ASIGNADOS:',
            err
          );


          this.proyectos=[];


        }


      });


  }






  evaluar(evaluacionId:number):void{


    console.log(
      '➡️ ENTRANDO A FORMULARIO ID:',
      evaluacionId
    );



    this.router.navigate([

      '/evaluador/formulario-evaluacion',

      evaluacionId

    ]);



  }



}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonButton,
  IonIcon,
  IonContent
} from '@ionic/angular/standalone';


import { addIcons } from 'ionicons';


import {
  downloadOutline,
  statsChartOutline,
  folderOutline,
  checkmarkDoneOutline,
  trophyOutline,
  documentOutline
} from 'ionicons/icons';


import { ReporteService } from '../../../core/services/reporte.service';



@Component({

  selector:'app-reportes',

  standalone:true,

  imports:[

    CommonModule,

    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonButton,
    IonIcon,
    IonContent

  ],

  templateUrl:'./reportes.page.html',

  styleUrls:['./reportes.page.scss']

})


export class ReportesPage implements OnInit {


  reportes = {

    proyectos:0,

    evaluaciones:0,

    completadas:0,

    promedio:0

  };



  proyectos:any[]=[];




  constructor(

    private reporteService:ReporteService

  ){


    addIcons({

      downloadOutline,

      statsChartOutline,

      folderOutline,

      checkmarkDoneOutline,

      trophyOutline,

      documentOutline

    });


  }





  ngOnInit():void{


    this.cargarDatos();


  }






  cargarDatos(){



    this.reporteService
    .getStats()
    .subscribe({


      next:(res:any)=>{


        console.log(
          'STATS:',
          res
        );


        this.reportes =
        res.data;


      },


      error:(err)=>{


        console.error(
          'Error stats:',
          err
        );


      }


    });







    this.reporteService
    .getReporteProyectos()
    .subscribe({


      next:(res:any)=>{


        console.log(
          'PROYECTOS:',
          res
        );


        this.proyectos =
        res.data ?? [];



      },


      error:(err)=>{


        console.error(
          'Error proyectos:',
          err
        );


        this.proyectos=[];


      }


    });



  }







  exportar(){


    this.reporteService
    .exportar()
    .subscribe({


      next:(archivo:Blob)=>{


        const url =
        window.URL
        .createObjectURL(
          archivo
        );



        const enlace =
        document.createElement(
          'a'
        );



        enlace.href=url;


        enlace.download =
        'reporte-evaluaciones.xlsx';



        enlace.click();



        window.URL
        .revokeObjectURL(
          url
        );



      },


      error:(err)=>{


        console.error(
          'Error exportando:',
          err
        );


      }



    });


  }



}
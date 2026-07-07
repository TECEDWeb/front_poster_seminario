import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReporteService } from '../../../core/services/reporte.service';


@Component({

  selector: 'app-reportes',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './reportes.page.html',

  styleUrls: [
    './reportes.page.scss'
  ]

})
export class ReportesPage implements OnInit {


  reportes = {

    proyectos: 0,

    evaluaciones: 0,

    completadas: 0,

    promedio: 0

  };


  proyectos: any[] = [];



  constructor(

    private reporteService: ReporteService

  ) {}



  ngOnInit(): void {

    this.cargarDatos();

  }




  cargarDatos(): void {


    this.reporteService
      .getStats()
      .subscribe({

        next: (res: any) => {


          console.log(
            'STATS:',
            res
          );


          this.reportes =
            res.data;


        },


        error: (err) => {


          console.error(
            'Error cargando estadísticas:',
            err
          );


        }

      });



    this.reporteService
      .getReporteProyectos()
      .subscribe({


        next: (res: any) => {


          console.log(
            'REPORTES POR PROYECTO:',
            res
          );


          this.proyectos =
            res.data ?? [];


        },


        error: (err) => {


          console.error(
            'Error cargando proyectos:',
            err
          );


          this.proyectos = [];


        }


      });


  }




  exportar(): void {


    console.log(
      'Exportando reporte...'
    );



    this.reporteService
      .exportar()
      .subscribe({


        next: (archivo: Blob) => {


          const url =
            window.URL
              .createObjectURL(
                archivo
              );



          const enlace =
            document.createElement(
              'a'
            );


          enlace.href = url;


          enlace.download =
            'reporte-evaluaciones.xlsx';



          enlace.click();



          window.URL
            .revokeObjectURL(
              url
            );


        },


        error: (err) => {


          console.error(
            'Error exportando reporte:',
            err
          );


        }


      });


  }


}
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
  IonContent,
  IonItem,
  IonLabel
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  downloadOutline,
  statsChartOutline,
  folderOutline,
  checkmarkDoneOutline,
  trophyOutline,
  barChartOutline
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
    IonContent,
    IonItem,
    IonLabel
  ],

  templateUrl:'./reportes.page.html',
  styleUrls:['./reportes.page.scss']

})
export class ReportesPage implements OnInit {


reportes:any={
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
barChartOutline

});


}





ngOnInit(){

this.cargarDatos();

}




cargarDatos(){



this.reporteService.getStats()
.subscribe({

next:(res:any)=>{


console.log(
"STATS",
res
);


this.reportes=res;


},


error:(err)=>{

console.error(
"Error stats",
err
)

}


});





this.reporteService
.getReporteProyectos()
.subscribe({

next:(res:any)=>{


console.log(
"REPORTES POR PROYECTO",
res
);



this.proyectos =
res.data ?? [];



},


error:(err)=>{


console.error(
"Error proyectos",
err
);


this.proyectos=[];


}



});


}




exportar(){


console.log(
"Exportando reporte..."
);



this.reporteService
.exportar()
.subscribe({

next:(blob:any)=>{


const url =
window.URL.createObjectURL(blob);



const a =
document.createElement('a');


a.href=url;

a.download=
'reporte-evaluaciones.xlsx';


a.click();



window.URL.revokeObjectURL(url);



},


error:(err)=>{


console.error(
"Error exportando",
err
);



}



});



}





}
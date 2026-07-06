import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
IonContent,
IonHeader,
IonToolbar,
IonTitle,
IonButton,
IonItem,
IonLabel,
IonSelect,
IonSelectOption,
IonList
} from '@ionic/angular/standalone';
import { ProyectoService } from '../../../core/services/proyecto.service';
import { EvaluadorService } from '../../../core/services/evaluador.service';
import { AsignacionService } from '../../../core/services/asignacion.service';

@Component({

selector:'app-asignaciones',

standalone:true,

imports:[
CommonModule,
FormsModule,
IonContent,
IonHeader,
IonToolbar,
IonTitle,
IonButton,
IonItem,
IonLabel,
IonSelect,
IonSelectOption,
IonList
],

templateUrl:'./asignaciones.page.html'

})

export class AsignacionesPage implements OnInit{

    proyectos:any[]=[];
    evaluadores:any[]=[];
    proyectoId:number|null=null;
    evaluadorId:number|null=null;

    constructor(
        private proyectoService:ProyectoService,
        private evaluadorService:EvaluadorService,
        private asignacionService:AsignacionService

    ){}

    ngOnInit(){

    this.cargar();

    }

    cargar(){

        this.proyectoService.listar()
        .subscribe(res=>{
            this.proyectos=res;
        });
        this.evaluadorService.listar()
        .subscribe((res:any)=>{
            this.evaluadores=res.data??res;
        });

    }

    guardar(){
        if(!this.proyectoId||!this.evaluadorId){
            alert("Seleccione proyecto y evaluador");
            return;
            }
            this.asignacionService.asignar({
                proyecto_id:this.proyectoId,
                evaluador_id:this.evaluadorId
            })

        .subscribe(()=>{
            alert("Proyecto asignado");
                this.proyectoId=null;
                this.evaluadorId=null;
            });
    }

}
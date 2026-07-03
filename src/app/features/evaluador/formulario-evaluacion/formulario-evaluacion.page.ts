import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  IonContent } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';

@Component({
  selector: 'app-formulario-evaluacion',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    HeaderComponent
  ],
  templateUrl: './formulario-evaluacion.page.html',
  styleUrls: ['./formulario-evaluacion.page.scss']
})
export class FormularioEvaluacionPage {

  proyectoId!: number;

  constructor(
    private route: ActivatedRoute
  ) {

    this.proyectoId = Number(
      this.route.snapshot.paramMap.get('id')
    );

  }

}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { RubricaService } from '../../../core/services/rubrica.service';
import { RubricaConcurso } from 'src/app/core/models/rubrica.model';

@Component({
  selector: 'app-rubricas',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    HeaderComponent
  ],
  templateUrl: './rubricas.page.html',
  styleUrls: ['./rubricas.page.scss']
})
export class RubricasPage implements OnInit {

  rubricas: RubricaConcurso[] = [];

  constructor(
    private rubricaService: RubricaService
  ) {}

  ngOnInit(): void {

    this.rubricaService.listar().subscribe(res => {
      this.rubricas = res;
    });

  }

}
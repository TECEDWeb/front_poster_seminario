import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonContent, IonIcon, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  trophyOutline, ribbonOutline, checkmarkCircleOutline,
  logInOutline, searchOutline, peopleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule, IonContent, IonIcon, IonButton],
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss']
})
export class InicioPage {
  constructor() {
    addIcons({
      trophyOutline, ribbonOutline, checkmarkCircleOutline,
      logInOutline, searchOutline, peopleOutline
    });
  }
}
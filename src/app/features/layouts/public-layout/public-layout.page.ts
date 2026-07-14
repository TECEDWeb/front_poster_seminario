import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonContent, IonIcon, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { schoolOutline, logInOutline } from 'ionicons/icons';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, IonContent, IonIcon, IonButton],
  templateUrl: './public-layout.page.html',
  styleUrls: ['./public-layout.page.scss']
})
export class PublicLayoutPage {
  currentYear = new Date().getFullYear();

  constructor() {
    addIcons({ schoolOutline, logInOutline });
  }
}
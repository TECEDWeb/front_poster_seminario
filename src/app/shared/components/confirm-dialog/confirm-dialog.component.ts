import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton
} from '@ionic/angular/standalone';

import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton
  ],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {

  @Input() title = 'Confirmar';
  @Input() message = '¿Estás seguro?';

  private modalCtrl = inject(ModalController);

  cancelar() {
    this.modalCtrl.dismiss(false);
  }

  confirmar() {
    this.modalCtrl.dismiss(true);
  }
}
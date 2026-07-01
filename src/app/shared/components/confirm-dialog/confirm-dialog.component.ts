import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, IonicModule],
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
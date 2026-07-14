import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonItem, IonInput, IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline, checkmarkCircleOutline, closeCircleOutline, ribbonOutline } from 'ionicons/icons';

import { CertificadoService } from '../../../core/services/certificado.service';

@Component({
  selector: 'app-consulta-certificados',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonItem, IonInput, IonButton, IonIcon, IonSpinner],
  templateUrl: './consulta-certificados.page.html',
  styleUrls: ['./consulta-certificados.page.scss']
})
export class ConsultaCertificadosPage {

  codigo = '';
  buscando = false;
  buscado = false;
  valido = false;
  data: any = null;

  constructor(private certificadoService: CertificadoService) {
    addIcons({ searchOutline, checkmarkCircleOutline, closeCircleOutline, ribbonOutline });
  }

  validar(): void {
    if (!this.codigo.trim()) return;

    this.buscando = true;
    this.buscado = false;
    this.data = null;

    this.certificadoService.validar(this.codigo.trim()).subscribe({
      next: (res) => {
        this.valido = res.valido;
        this.data = res.data || null;
        this.buscando = false;
        this.buscado = true;
      },
      error: () => {
        this.valido = false;
        this.data = null;
        this.buscando = false;
        this.buscado = true;
      }
    });
  }
}
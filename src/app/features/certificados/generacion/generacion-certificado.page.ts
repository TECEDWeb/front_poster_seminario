import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  IonContent,
  IonButton,
  IonSpinner
} from '@ionic/angular/standalone';

import { CertificadoService } from '../../../core/services/certificado.service';

@Component({
  selector: 'app-generacion-certificado',
  standalone: true,
  imports: [
    CommonModule,

    // Ionic Standalone
    IonContent,
    IonButton,
    IonSpinner
  ],
  templateUrl: './generacion-certificado.page.html',
  styleUrls: ['./generacion-certificado.page.scss']
})
export class GeneracionCertificadoPage {

  loading = false;
  mensaje = '';

  constructor(
    private certificadoService: CertificadoService
  ) {}

  generarCertificado(): void {

    this.loading = true;
    this.mensaje = '';

    const data = {
      proyectoId: 1,
      usuarioId: 1
    };

    this.certificadoService.generar(data).subscribe({

      next: () => {

        this.mensaje = 'Certificado generado correctamente';
        this.loading = false;

      },

      error: () => {

        this.mensaje = 'Error al generar certificado';
        this.loading = false;

      }

    });

  }

}
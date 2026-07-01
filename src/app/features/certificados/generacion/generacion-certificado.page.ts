import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { CertificadoService } from '../../../core/services/certificado.service';

@Component({
  selector: 'app-generacion-certificado',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './generacion-certificado.page.html',
  styleUrls: ['./generacion-certificado.page.scss']
})
export class GeneracionCertificadoPage {

  loading = false;
  mensaje = '';

  constructor(private certificadoService: CertificadoService) {}

  generarCertificado() {

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
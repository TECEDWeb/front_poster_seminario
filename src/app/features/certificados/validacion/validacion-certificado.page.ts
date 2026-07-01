import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CertificadoService } from '../../../core/services/certificado.service';

@Component({
  selector: 'app-validacion-certificado',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './validacion-certificado.page.html',
  styleUrls: ['./validacion-certificado.page.scss']
})
export class ValidacionCertificadoPage {

  codigo = '';
  resultado: any = null;
  error = '';

  constructor(private certificadoService: CertificadoService) {}

  validar() {

    this.resultado = null;
    this.error = '';

    this.certificadoService.validar(this.codigo).subscribe({

      next: (res) => {
        this.resultado = res;
      },

      error: () => {
        this.error = 'Certificado no válido';
      }

    });

  }

}
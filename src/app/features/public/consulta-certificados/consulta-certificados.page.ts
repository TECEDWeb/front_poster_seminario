import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CertificadoService } from '../../../core/services/certificado.service';

@Component({
  selector: 'app-consulta-certificados',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './consulta-certificados.page.html',
  styleUrls: ['./consulta-certificados.page.scss']
})
export class ConsultaCertificadosPage {

  codigo = '';
  resultado: any = null;
  error = '';

  constructor(private certificadoService: CertificadoService) {}

  buscar() {

    this.resultado = null;
    this.error = '';

    this.certificadoService.validar(this.codigo).subscribe({

      next: (res) => {
        this.resultado = res;
      },

      error: () => {
        this.error = 'Certificado no encontrado';
      }

    });

  }

}
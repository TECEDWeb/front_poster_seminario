import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle,
  IonContent, IonButton, IonIcon, IonSkeletonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { ribbonOutline, downloadOutline, refreshOutline, alertCircleOutline } from 'ionicons/icons';

import { CertificadoService } from '../../../core/services/certificado.service';
import { Certificado } from '../../../core/models/certificado.model';

@Component({
  selector: 'app-mis-certificados',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle,
    IonContent, IonButton, IonIcon, IonSkeletonText
  ],
  templateUrl: './mis-certificados.page.html',
  styleUrls: ['./mis-certificados.page.scss']
})
export class MisCertificadosPage implements OnInit {

  certificados: Certificado[] = [];
  cargando = true;
  error: string | null = null;

  constructor(private certificadoService: CertificadoService) {
    addIcons({ ribbonOutline, downloadOutline, refreshOutline, alertCircleOutline });
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = null;

    this.certificadoService.misCertificados().subscribe({
      next: (data) => {
        this.certificados = data;
        this.cargando = false;
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al cargar tus certificados';
        this.certificados = [];
        this.cargando = false;
      }
    });
  }

  descargar(certificado: Certificado): void {
    this.certificadoService.descargarPdf(certificado.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificado-${certificado.codigo}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: () => alert('Error al descargar el certificado')
    });
  }

  trackById(index: number, item: Certificado): number {
    return item?.id ?? index;
  }
}
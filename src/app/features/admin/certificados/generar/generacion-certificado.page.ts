import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonButtons, IonMenuButton, IonBackButton, IonTitle,
  IonContent, IonButton, IonIcon, IonItem, IonSelect, IonSelectOption,
  IonInput, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  ribbonOutline, personOutline, cardOutline, trophyOutline,
  downloadOutline, checkmarkCircleOutline, alertCircleOutline, refreshOutline,
  arrowBackOutline
} from 'ionicons/icons';

import { CertificadoService } from '../../../../core/services/certificado.service';
import { ProyectoService } from '../../../../core/services/proyecto.service';
import { Certificado } from '../../../../core/models/certificado.model';

@Component({
  selector: 'app-generacion-certificado',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonButtons, IonMenuButton, IonBackButton, IonTitle,
    IonContent, IonButton, IonIcon, IonItem, IonSelect, IonSelectOption,
    IonInput, IonSpinner
  ],
  templateUrl: './generacion-certificado.page.html',
  styleUrls: ['./generacion-certificado.page.scss']
})
export class GeneracionCertificadoPage implements OnInit {

  proyectos: any[] = [];
  cargandoProyectos = true;

  proyectoSeleccionadoId: number | null = null;
  participanteNombre = '';
  participanteCedula = '';
  tipoCertificado = 'Participación';

  generando = false;
  certificadoGenerado: Certificado | null = null;
  error: string | null = null;

  constructor(
    private certificadoService: CertificadoService,
    private proyectoService: ProyectoService,
    private router: Router
  ) {
    addIcons({
      ribbonOutline, personOutline, cardOutline, trophyOutline,
      downloadOutline, checkmarkCircleOutline, alertCircleOutline, refreshOutline,
      arrowBackOutline
    });
  }

  ngOnInit(): void {
    this.cargarProyectos();
  }

  cargarProyectos(): void {
    this.cargandoProyectos = true;
    this.proyectoService.listar().subscribe({
      next: (data: any) => {
        this.proyectos = Array.isArray(data) ? data : [];
        this.cargandoProyectos = false;
      },
      error: () => {
        this.proyectos = [];
        this.cargandoProyectos = false;
      }
    });
  }

  onProyectoSeleccionado(): void {
    const proyecto = this.proyectos.find(p => p.id === this.proyectoSeleccionadoId);
    if (proyecto?.participantes?.length) {
      this.participanteNombre = proyecto.participantes[0].nombre || '';
      this.participanteCedula = proyecto.participantes[0].cedula || '';
    }
  }

  generarCertificado(): void {
    this.error = null;

    if (!this.proyectoSeleccionadoId) {
      this.error = 'Selecciona un proyecto';
      return;
    }
    if (!this.participanteNombre.trim() || !this.participanteCedula.trim()) {
      this.error = 'Nombre y cédula del participante son obligatorios';
      return;
    }

    this.generando = true;
    this.certificadoGenerado = null;

    this.certificadoService.generar({
      proyectoId: this.proyectoSeleccionadoId,
      participanteNombre: this.participanteNombre,
      participanteCedula: this.participanteCedula,
      tipoCertificado: this.tipoCertificado
    }).subscribe({
      next: (certificado) => {
        this.certificadoGenerado = certificado;
        this.generando = false;
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al generar el certificado';
        this.generando = false;
      }
    });
  }

  resetForm(): void {
    this.proyectoSeleccionadoId = null;
    this.participanteNombre = '';
    this.participanteCedula = '';
    this.tipoCertificado = 'Participación';
    this.certificadoGenerado = null;
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

  irAGestion(): void {
    this.router.navigate(['/admin/certificados/gestion']);
  }
}
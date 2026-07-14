import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle,
  IonContent, IonButton, IonIcon, IonItem, IonSelect, IonSelectOption,
  IonInput, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  ribbonOutline, personOutline, cardOutline, trophyOutline,
  downloadOutline, checkmarkCircleOutline, alertCircleOutline, refreshOutline
} from 'ionicons/icons';

import { CertificadoService } from 'src/app/core/services/certificado.service'; 
import { ProyectoService } from 'src/app/core/services/proyecto.service'; 
import { Certificado } from 'src/app/core/models/certificado.model'; 

@Component({
  selector: 'app-generacion-certificado',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle,
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

  certificados: Certificado[] = [];
  cargandoLista = true;

  constructor(
    private certificadoService: CertificadoService,
    private proyectoService: ProyectoService
  ) {
    addIcons({
      ribbonOutline, personOutline, cardOutline, trophyOutline,
      downloadOutline, checkmarkCircleOutline, alertCircleOutline, refreshOutline
    });
  }

  ngOnInit(): void {
    this.cargarProyectos();
    this.cargarCertificados();
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

  cargarCertificados(): void {
    this.cargandoLista = true;
    this.certificadoService.listar().subscribe({
      next: (data) => {
        this.certificados = data;
        this.cargandoLista = false;
      },
      error: () => {
        this.certificados = [];
        this.cargandoLista = false;
      }
    });
  }

  onProyectoSeleccionado(): void {
    const proyecto = this.proyectos.find(p => p.id === this.proyectoSeleccionadoId);
    // Si el proyecto ya trae un participante principal, lo precargamos
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
        this.cargarCertificados();
        this.resetForm();
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

  trackById(index: number, item: any): number {
    return item?.id ?? index;
  }
}
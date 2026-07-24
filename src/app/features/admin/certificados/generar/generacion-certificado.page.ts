import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
  IonContent, IonButton, IonIcon, IonItem, IonSelect, IonSelectOption,
  IonInput, IonSegment, IonSegmentButton, IonLabel, IonDatetime
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  ribbonOutline, personOutline, cardOutline, trophyOutline,
  downloadOutline, checkmarkCircleOutline, alertCircleOutline, refreshOutline,
  arrowBackOutline, calendarOutline, locationOutline, bookOutline, listOutline
} from 'ionicons/icons';

import { CertificadoService } from '../../../../core/services/certificado.service';
import { ProyectoService } from '../../../../core/services/proyecto.service';
import { Certificado } from '../../../../core/models/certificado.model';

interface Persona {
  nombre: string;
  cedula: string;
}

@Component({
  selector: 'app-generacion-certificado',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
    IonContent, IonButton, IonIcon, IonItem, IonSelect, IonSelectOption,
    IonInput, IonSegment, IonSegmentButton, IonLabel, IonDatetime
  ],
  templateUrl: './generacion-certificado.page.html',
  styleUrls: ['./generacion-certificado.page.scss']
})
export class GeneracionCertificadoPage implements OnInit {

  proyectos: any[] = [];
  cargandoProyectos = true;

  proyectoSeleccionadoId: number | null = null;

  // Rol y persona seleccionada dentro del proyecto
  rol: 'participante' | 'tutor' = 'participante';
  personasDisponibles: Persona[] = [];
  personaSeleccionadaIdx: number | null = null;

  participanteNombre = '';
  participanteCedula = '';
  tipoCertificado = 'Participación';

  // Datos del evento/actividad — necesarios para el texto del certificado
  nombreEvento = '';
  categoriaActividad = 'concurso de pósteres científicos';
  fechaEvento: string = new Date().toISOString();
  lugar = 'La Libertad';

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
      arrowBackOutline, calendarOutline, locationOutline, bookOutline, listOutline
    });
  }

  ngOnInit(): void {
    this.cargarProyectos();
  }

  cargarProyectos(): void {
    this.cargandoProyectos = true;
    this.proyectoService.listar().subscribe({
      next: (data: any) => {
        this.proyectos = Array.isArray(data) ? data : (data?.data ?? []);
        this.cargandoProyectos = false;
      },
      error: () => {
        this.proyectos = [];
        this.cargandoProyectos = false;
      }
    });
  }

  get proyectoSeleccionado(): any {
    return this.proyectos.find(p => p.id === this.proyectoSeleccionadoId) || null;
  }

  onProyectoSeleccionado(): void {
    this.actualizarPersonasDisponibles();

    // Prefijar el nombre del evento con el nombre del concurso si existe,
    // para no escribirlo a mano cada vez.
    const proyecto = this.proyectoSeleccionado;
    if (proyecto?.concursoNombre && !this.nombreEvento) {
      this.nombreEvento = proyecto.concursoNombre;
    }
  }

  onRolChange(): void {
    this.actualizarPersonasDisponibles();
  }

  private actualizarPersonasDisponibles(): void {
    const proyecto = this.proyectoSeleccionado;
    const lista = this.rol === 'tutor'
      ? (proyecto?.tutores ?? [])
      : (proyecto?.participantes ?? []);

    this.personasDisponibles = lista;
    this.personaSeleccionadaIdx = null;
    this.participanteNombre = '';
    this.participanteCedula = '';
  }

  onPersonaSeleccionada(): void {
    if (this.personaSeleccionadaIdx === null) return;
    const persona = this.personasDisponibles[this.personaSeleccionadaIdx];
    this.participanteNombre = persona?.nombre || '';
    this.participanteCedula = persona?.cedula || '';
  }

  generarCertificado(): void {
    this.error = null;

    if (!this.proyectoSeleccionadoId) {
      this.error = 'Selecciona un proyecto';
      return;
    }
    if (!this.participanteNombre.trim() || !this.participanteCedula.trim()) {
      this.error = `Selecciona o ingresa el nombre y cédula del ${this.rol}`;
      return;
    }
    if (!this.nombreEvento.trim()) {
      this.error = 'Ingresa el nombre del evento (ej. "V Seminario Técnico Científico FACSISTEL 2026")';
      return;
    }
    if (!this.categoriaActividad.trim()) {
      this.error = 'Ingresa la categoría de la actividad (ej. "concurso de pósteres científicos")';
      return;
    }

    this.generando = true;
    this.certificadoGenerado = null;

    const fechaEventoISO = new Date(this.fechaEvento).toISOString().split('T')[0];

    this.certificadoService.generar({
      proyectoId: this.proyectoSeleccionadoId,
      participanteNombre: this.participanteNombre,
      participanteCedula: this.participanteCedula,
      tipoCertificado: this.tipoCertificado,
      rol: this.rol,
      nombreEvento: this.nombreEvento,
      categoriaActividad: this.categoriaActividad,
      fechaEvento: fechaEventoISO,
      lugar: this.lugar
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
    this.rol = 'participante';
    this.personasDisponibles = [];
    this.personaSeleccionadaIdx = null;
    this.participanteNombre = '';
    this.participanteCedula = '';
    this.tipoCertificado = 'Participación';
    this.nombreEvento = '';
    this.categoriaActividad = 'concurso de pósteres científicos';
    this.fechaEvento = new Date().toISOString();
    this.lugar = 'La Libertad';
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
// src/app/features/coordinador/certificados/generar/generacion-certificado.page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonTextarea,
  IonButton,
  IonIcon,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  IonAlert,
  IonSkeletonText
  // Eliminados: IonChip, IonBadge, IonRow, IonCol, IonGrid, IonList, IonRadioGroup, IonRadio, IonCheckbox, IonToggle, IonRange
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  saveOutline,
  downloadOutline,
  closeOutline,
  peopleOutline,
  documentTextOutline,
  calendarOutline,
  locationOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  arrowBackOutline,
  trashOutline,
  eyeOutline
} from 'ionicons/icons';
import { CertificadoService } from 'src/app/core/services/certificado.service';
import { ProyectoService } from 'src/app/core/services/proyecto.service';
import { ConcursoService } from 'src/app/core/services/concurso.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-generacion-certificado',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonTextarea,
    IonButton,
    IonIcon,
    IonText,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonSpinner,
    IonAlert,
    IonSkeletonText
  ],
  templateUrl: './generacion-certificado.page.html',
  styleUrls: ['./generacion-certificado.page.scss']
})
export class GeneracionCertificadoPage implements OnInit {

  form: FormGroup;
  proyectos: any[] = [];
  concursos: any[] = [];
  concursoAsignado: any = null;
  proyectoSeleccionado: any = null;
  cargando: boolean = false;
  generando: boolean = false;
  certificadoGenerado: any = null;
  mostrarError: boolean = false;
  mensajeError: string = '';
  mostrandoPreview: boolean = false;

  botonesExito: any[] = [];
  botonesError: any[] = [];

  tiposCertificado = [
    { value: 'participacion', label: 'Participación' },
    { value: 'expositor', label: 'Expositor' },
    { value: 'asistente', label: 'Asistente' },
    { value: 'organizador', label: 'Organizador' },
    { value: 'ponente', label: 'Ponente' },
    { value: 'tallerista', label: 'Tallerista' },
    { value: 'mejor_trabajo', label: 'Mejor Trabajo' },
    { value: 'reconocimiento', label: 'Reconocimiento' }
  ];

  roles = [
    { value: 'participante', label: 'Participante' },
    { value: 'tutor', label: 'Tutor' },
    { value: 'evaluador', label: 'Evaluador' },
    { value: 'organizador', label: 'Organizador' }
  ];

  constructor(
    private fb: FormBuilder,
    private certificadoService: CertificadoService,
    private proyectoService: ProyectoService,
    private concursoService: ConcursoService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    addIcons({
      saveOutline,
      downloadOutline,
      closeOutline,
      peopleOutline,
      documentTextOutline,
      calendarOutline,
      locationOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      arrowBackOutline,
      trashOutline,
      eyeOutline
    });

    this.botonesExito = [
      {
        text: 'Descargar nuevamente',
        handler: () => this.descargarNuevamente()
      },
      {
        text: 'Cerrar',
        handler: () => this.cerrarExito()
      }
    ];

    this.botonesError = [
      {
        text: 'Cerrar',
        handler: () => this.cerrarError()
      }
    ];

    this.form = this.fb.group({
      proyectoId: ['', Validators.required],
      concursoId: ['', Validators.required],
      tipo: ['participacion', Validators.required],
      rol: ['participante', Validators.required],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      cedula: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      nombreEvento: ['', Validators.required],
      categoriaActividad: ['', Validators.required],
      fechaEvento: ['', Validators.required],
      fechaEmision: [new Date().toISOString().split('T')[0], Validators.required],
      lugar: [''],
      contenido: ['', Validators.required],
      firmantes: ['']
    });
  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales(): void {
    this.cargando = true;
    
    this.concursoService.listarActivos().subscribe({
      next: (concursos: any) => {
        const data = concursos?.data ?? concursos ?? [];
        if (data && data.length > 0) {
          this.concursoAsignado = data[0];
          this.form.patchValue({ concursoId: this.concursoAsignado.id });
        }
        this.cargarProyectos();
      },
      error: () => {
        this.cargarProyectos();
      }
    });
  }

  cargarProyectos(): void {
    this.proyectoService.listar().subscribe({
      next: (proyectos: any) => {
        this.proyectos = proyectos?.data ?? proyectos ?? [];
        this.cargando = false;
        
        this.route.queryParams.subscribe(params => {
          if (params['proyectoId']) {
            const id = Number(params['proyectoId']);
            this.form.patchValue({ proyectoId: id });
            this.onProyectoChange(id);
          }
        });
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  get f() {
    return this.form.controls;
  }

  isInvalid(campo: string): boolean {
    const control = this.form.get(campo);
    return control ? control.invalid && control.touched : false;
  }

  getErrorMessage(campo: string): string {
    const control = this.form.get(campo);
    if (!control) return '';
    
    if (control.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control.hasError('minlength')) {
      return `Mínimo ${control.errors?.['minlength']?.requiredLength} caracteres`;
    }
    if (control.hasError('pattern')) {
      return 'Formato inválido';
    }
    return '';
  }

  getTipoText(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'participacion': 'Participación',
      'expositor': 'Expositor',
      'asistente': 'Asistente',
      'organizador': 'Organizador',
      'ponente': 'Ponente',
      'tallerista': 'Tallerista',
      'mejor_trabajo': 'Mejor Trabajo',
      'reconocimiento': 'Reconocimiento'
    };
    return tipos[tipo] || tipo;
  }

  getRolText(rol: string): string {
    const roles: { [key: string]: string } = {
      'participante': 'Participante',
      'tutor': 'Tutor',
      'evaluador': 'Evaluador',
      'organizador': 'Organizador'
    };
    return roles[rol] || rol;
  }

  getNombreProyecto(id: number): string {
    const proyecto = this.proyectos.find(p => p.id === id);
    return proyecto?.nombre || proyecto?.titulo || 'Proyecto';
  }

  volver(): void {
    this.router.navigate(['/coordinador/certificados/gestion']);
  }

  onProyectoChange(event: any): void {
    const proyectoId = typeof event === 'number' ? event : event?.detail?.value;
    if (proyectoId) {
      this.cargarDetalleProyecto(proyectoId);
    }
  }

  cargarDetalleProyecto(proyectoId: number): void {
    this.proyectoService.obtener(proyectoId).subscribe({
      next: (proyecto: any) => {
        this.proyectoSeleccionado = proyecto?.data ?? proyecto;
        if (this.proyectoSeleccionado) {
          this.form.patchValue({
            nombre: this.proyectoSeleccionado.titulo || this.proyectoSeleccionado.nombre || '',
            categoriaActividad: this.proyectoSeleccionado.categoria || this.proyectoSeleccionado.area || '',
            contenido: this.proyectoSeleccionado.descripcion || this.proyectoSeleccionado.resumen || ''
          });
        }
      },
      error: () => {}
    });
  }

  limpiarForm(): void {
    this.form.reset({
      tipo: 'participacion',
      rol: 'participante',
      fechaEmision: new Date().toISOString().split('T')[0]
    });
    this.proyectoSeleccionado = null;
    this.certificadoGenerado = null;
    this.mensajeError = '';
    this.mostrarError = false;
  }

  togglePreview(): void {
    this.mostrandoPreview = !this.mostrandoPreview;
  }

  generarCertificado(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.mostrarError = true;
      this.mensajeError = 'Por favor, complete todos los campos requeridos correctamente.';
      return;
    }

    this.generando = true;
    this.certificadoGenerado = null;
    this.mostrarError = false;

    const formValue = this.form.value;
    const payload = {
      proyectoId: formValue.proyectoId,
      concursoId: formValue.concursoId,
      participanteNombre: formValue.nombre,
      participanteCedula: formValue.cedula,
      tipoCertificado: formValue.tipo,
      rol: formValue.rol,
      nombreEvento: formValue.nombreEvento || this.concursoAsignado?.nombre || 'Evento',
      categoriaActividad: formValue.categoriaActividad,
      fechaEvento: formValue.fechaEvento,
      fechaEmision: formValue.fechaEmision || new Date().toISOString().split('T')[0],
      lugar: formValue.lugar,
      contenido: formValue.contenido,
      firmantes: formValue.firmantes ? JSON.parse(formValue.firmantes) : undefined
    };

    this.certificadoService.crear(payload).subscribe({
      next: (certificado: any) => {
        this.certificadoGenerado = certificado?.data ?? certificado;
        this.generando = false;

        if (this.certificadoGenerado?.id) {
          setTimeout(() => {
            this.descargarCertificado(this.certificadoGenerado.id);
          }, 500);
        }
      },
      error: (err: any) => {
        this.generando = false;
        this.mostrarError = true;
        this.mensajeError = err?.error?.message || err?.message || 'Error al generar el certificado.';
      }
    });
  }

  descargarCertificado(id: number): void {
    this.certificadoService.descargar(id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificado-${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.mostrarError = true;
        this.mensajeError = 'Error al descargar el certificado.';
      }
    });
  }

  descargarNuevamente(): void {
    if (this.certificadoGenerado?.id) {
      this.descargarCertificado(this.certificadoGenerado.id);
    }
  }

  cerrarExito(): void {
    this.certificadoGenerado = null;
  }

  cerrarError(): void {
    this.mostrarError = false;
    this.mensajeError = '';
  }

  trackById(index: number, item: any): number {
    return item?.id ?? index;
  }
}
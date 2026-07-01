import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonButton,
  IonIcon,
  IonContent,
  IonSearchbar
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  addOutline,
  createOutline,
  swapHorizontalOutline,
  keyOutline
} from 'ionicons/icons';

import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    // Ionic Standalone
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonButton,
    IonIcon,
    IonContent,
    IonSearchbar
  ],
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss']
})
export class UsuariosPage implements OnInit {

  usuarios: Usuario[] = [];

  modalAbierto = false;
  editando = false;
  guardando = false;
  cargando = false;

  busqueda = '';

  form: any = {
    id: null,
    cedula: '',
    nombre: '',
    email: '',
    rol: 'evaluador',
    password: '',
    activo: true
  };

  constructor(
    private usuarioService: UsuarioService
  ) {

    addIcons({
      addOutline,
      createOutline,
      swapHorizontalOutline,
      keyOutline
    });

  }

  ngOnInit(): void {
    this.cargar();
  }

  // =========================
  // LISTAR
  // =========================

  cargar(): void {

    this.cargando = true;

    this.usuarioService.listar().subscribe({

      next: (res: any) => {

        this.usuarios = res.usuarios ?? [];
        this.cargando = false;

      },

      error: () => {

        this.usuarios = [];
        this.cargando = false;

      }

    });

  }

  // =========================
  // MODAL
  // =========================

  abrirCrear(): void {

    this.editando = false;

    this.form = {
      id: null,
      cedula: '',
      nombre: '',
      email: '',
      rol: 'evaluador',
      password: '',
      activo: true
    };

    this.modalAbierto = true;

  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  editar(u: Usuario): void {

    this.editando = true;
    this.form = { ...u, password: '' };
    this.modalAbierto = true;

  }

  guardar(): void {

    this.guardando = true;

    const req = this.editando
      ? this.usuarioService.actualizar(this.form.id, this.form)
      : this.usuarioService.crear(this.form);

    req.subscribe({

      next: () => {

        this.guardando = false;
        this.modalAbierto = false;

        this.cargar();

      },

      error: () => {

        this.guardando = false;

      }

    });

  }

  // =========================
  // ESTADO
  // =========================

  cambiarEstado(u: Usuario): void {

    this.usuarioService.cambiarEstado(u.id).subscribe({

      next: () => this.cargar(),

      error: (err: any) => console.error(err)

    });

  }

  resetPass(u: Usuario): void {

    this.usuarioService.resetPassword(u.id).subscribe();

  }

  iniciales(nombre: string): string {

    if (!nombre) {
      return '';
    }

    return nombre
      .split(' ')
      .map(p => p[0])
      .join('')
      .toUpperCase();

  }

  // =========================
  // GETTERS
  // =========================

  get totalActivos(): number {

    return this.usuarios.filter(u => u.activo).length;

  }

  get totalEvaluadores(): number {

    return this.usuarios.filter(u => u.rol === 'evaluador').length;

  }

}
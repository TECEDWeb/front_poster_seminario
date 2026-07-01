import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
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

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit() {
    this.cargar();
  }

  // =========================
  // LISTAR
  // =========================
  cargar() {
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
  abrirCrear() {
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

  cerrarModal() {
    this.modalAbierto = false;
  }

  editar(u: any) {
    this.editando = true;
    this.form = { ...u, password: '' };
    this.modalAbierto = true;
  }

  guardar() {
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
  // ESTADO (FIX REAL)
  // =========================
  cambiarEstado(u: any) {
    this.usuarioService.cambiarEstado(u.id).subscribe({
      next: () => this.cargar(),
      error: (err: any) => console.error(err)
    });
  }

  resetPass(u: any) {
    this.usuarioService.resetPassword(u.id).subscribe();
  }

  iniciales(nombre: string) {
    if (!nombre) return '';
    return nombre.split(' ').map(p => p[0]).join('').toUpperCase();
  }

  // =========================
  // GETTERS (SIN ERROR EN HTML)
  // =========================
  get totalActivos(): number {
    return (this.usuarios || []).filter(u => u.activo).length;
  }

  get totalEvaluadores(): number {
    return (this.usuarios || []).filter(u => u.rol === 'evaluador').length;
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonButton,
  IonIcon,
  IonContent,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonFab,
  IonFabButton,
  IonModal,
  IonInput,
  IonToggle,
  IonItem,
  IonSkeletonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, createOutline, swapHorizontalOutline, keyOutline, closeOutline,
  cardOutline, mailOutline, personOutline, briefcaseOutline, toggleOutline,
  checkmarkOutline, refreshOutline, searchOutline, peopleOutline, timeOutline,
  callOutline, trashOutline, eyeOutline, shieldOutline, copyOutline, diceOutline
} from 'ionicons/icons';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario, Rol } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonButton,
    IonIcon,
    IonContent,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonFab,
    IonFabButton,
    IonModal,
    IonInput,
    IonToggle,
    IonItem,
    IonSkeletonText
  ],
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss']
})
export class UsuariosPage implements OnInit {

  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  modalAbierto = false;
  editando = false;
  guardando = false;
  cargando = false;
  busqueda = '';
  filtroRol: string = 'todos';
  filtroEstado: string = 'todos';
  modalResetAbierto = false;
  usuarioParaReset: Usuario | null = null;
  modoReset: 'random' | 'manual' = 'random';
  passwordManual = '';
  reseteando = false;
  passwordResultado: string | null = null;
  copiado = false;

  form: any = {
    id: null,
    cedula: '',
    nombre: '',
    email: '',
    rol: 'evaluador' as Rol,
    password: '',
    activo: true,
    telefono: ''
  };

  constructor(private usuarioService: UsuarioService) {
    addIcons({
      addOutline, createOutline, swapHorizontalOutline, keyOutline, closeOutline,
      cardOutline, mailOutline, personOutline, briefcaseOutline, toggleOutline,
      checkmarkOutline, refreshOutline, searchOutline, peopleOutline, timeOutline,
      callOutline, trashOutline, eyeOutline, shieldOutline, copyOutline, diceOutline
    });
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;

    this.usuarioService.listar().subscribe({
      next: (res: any) => {
        console.log('Usuarios cargados:', res);
        this.usuarios = res?.usuarios ?? res?.data ?? res ?? [];
        this.filtrarUsuarios();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando usuarios:', err);
        this.usuarios = [];
        this.usuariosFiltrados = [];
        this.cargando = false;
      }
    });
  }

  filtrarUsuarios(): void {
    let filtered = [...this.usuarios];

    if (this.busqueda.trim()) {
      const texto = this.busqueda.toLowerCase().trim();
      filtered = filtered.filter(u =>
        u.nombre?.toLowerCase().includes(texto) ||
        u.cedula?.includes(texto) ||
        u.email?.toLowerCase().includes(texto)
      );
    }

    if (this.filtroRol !== 'todos') {
      filtered = filtered.filter(u => u.rol === this.filtroRol);
    }

    if (this.filtroEstado === 'activo') {
      filtered = filtered.filter(u => u.activo);
    } else if (this.filtroEstado === 'inactivo') {
      filtered = filtered.filter(u => !u.activo);
    }

    this.usuariosFiltrados = filtered;
  }

  abrirCrear(): void {
    this.editando = false;
    this.form = {
      id: null,
      cedula: '',
      nombre: '',
      email: '',
      rol: 'evaluador' as Rol,
      password: '',
      activo: true,
      telefono: ''
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
    if (!this.form.cedula || !this.form.nombre || !this.form.rol) {
      alert('Por favor complete los campos requeridos');
      return;
    }

    if (this.form.cedula.length < 10) {
      alert('La cédula debe tener al menos 10 dígitos');
      return;
    }

    if (!this.editando && !this.form.password) {
      alert('Debe ingresar una contraseña');
      return;
    }

    if (!this.editando && this.form.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    this.guardando = true;

    const payload = {
      cedula: this.form.cedula.trim(),
      nombre: this.form.nombre.trim(),
      email: this.form.email?.trim() || null,
      rol: this.form.rol,
      activo: this.form.activo,
      telefono: this.form.telefono?.trim() || null,
      password: this.form.password || undefined
    };

    const req = this.editando
      ? this.usuarioService.actualizar(this.form.id, payload)
      : this.usuarioService.crear(payload);

    req.subscribe({
      next: () => {
        this.guardando = false;
        this.modalAbierto = false;
        this.cargar();
        alert(this.editando ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
      },
      error: (err) => {
        this.guardando = false;
        console.error('Error guardando usuario:', err);
        alert(err.error?.mensaje || 'Error al guardar el usuario');
      }
    });
  }

  cambiarEstado(u: Usuario): void {
    const nuevoEstado = !u.activo;
    const mensaje = nuevoEstado ? 'activar' : 'desactivar';

    if (confirm(`¿Estás seguro de ${mensaje} al usuario "${u.nombre}"?`)) {
      this.usuarioService.cambiarEstado(u.id).subscribe({
        next: () => {
          this.cargar();
          alert(`Usuario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`);
        },
        error: (err: any) => {
          console.error('Error cambiando estado:', err);
          alert(err.error?.mensaje || 'Error al cambiar el estado');
        }
      });
    }
  }

  abrirModalReset(u: Usuario): void {
    this.usuarioParaReset = u;
    this.modoReset = 'random';
    this.passwordManual = '';
    this.passwordResultado = null;
    this.copiado = false;
    this.modalResetAbierto = true;
  }

  cerrarModalReset(): void {
    this.modalResetAbierto = false;
    this.usuarioParaReset = null;
    this.passwordResultado = null;
  }

  confirmarReset(): void {
    if (!this.usuarioParaReset) return;

    if (this.modoReset === 'manual') {
      if (!this.passwordManual || this.passwordManual.length < 6) {
        alert('La contraseña manual debe tener al menos 6 caracteres');
        return;
      }
    }

    this.reseteando = true;

    const passwordAEnviar = this.modoReset === 'manual' ? this.passwordManual : undefined;

    this.usuarioService.resetPassword(this.usuarioParaReset.id, passwordAEnviar).subscribe({
      next: (res) => {
        this.reseteando = false;
        this.passwordResultado = res.data.nuevaPassword;
      },
      error: (err) => {
        this.reseteando = false;
        console.error('Error resetando password:', err);
        alert(err.error?.mensaje || 'Error al resetear la contraseña');
      }
    });
  }

  copiarPassword(): void {
    if (!this.passwordResultado) return;
    navigator.clipboard.writeText(this.passwordResultado).then(() => {
      this.copiado = true;
      setTimeout(() => this.copiado = false, 2000);
    });
  }

  confirmarEliminar(u: Usuario): void {
    if (confirm(`¿Estás seguro de eliminar al usuario "${u.nombre}"?`)) {
      this.eliminarUsuario(u.id);
    }
  }

  eliminarUsuario(id: number): void {
    this.usuarioService.eliminar(id).subscribe({
      next: () => {
        this.cargar();
        alert('Usuario eliminado correctamente');
      },
      error: (err) => {
        console.error('Error eliminando usuario:', err);
        alert(err.error?.mensaje || 'Error al eliminar el usuario');
      }
    });
  }

  iniciales(nombre: string): string {
    if (!nombre) return '';
    return nombre
      .split(' ')
      .map(p => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getAvatarColor(rol: string): string {
    const colors: Record<string, string> = {
      'admin': 'avatar-admin',
      'evaluador': 'avatar-evaluador',
      'coordinador': 'avatar-coordinador'
    };
    return colors[rol] || 'avatar-evaluador';
  }

  getRolClass(rol: string): string {
    const classes: Record<string, string> = {
      'admin': 'admin',
      'evaluador': 'evaluador',
      'coordinador': 'coordinador'
    };
    return classes[rol] || 'evaluador';
  }

  getRolLabel(rol: string): string {
    const labels: Record<string, string> = {
      'admin': 'Administrador',
      'evaluador': 'Evaluador',
      'coordinador': 'Coordinador'
    };
    return labels[rol] || rol;
  }

  getRolIcon(rol: string): string {
    const icons: Record<string, string> = {
      'admin': 'shield-outline',
      'evaluador': 'person-outline',
      'coordinador': 'people-outline'
    };
    return icons[rol] || 'person-outline';
  }

  get totalActivos(): number {
    return this.usuarios.filter(u => u.activo).length;
  }

  get totalEvaluadores(): number {
    return this.usuarios.filter(u => u.rol === 'evaluador').length;
  }

  get totalAdministradores(): number {
    return this.usuarios.filter(u => u.rol === 'admin').length;
  }

  get totalCoordinadores(): number {
    return this.usuarios.filter(u => u.rol === 'coordinador').length;
  }

  trackById(index: number, item: any): number {
    return item?.id ?? index;
  }
}
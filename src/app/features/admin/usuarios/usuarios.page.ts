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
  addOutline,
  createOutline,
  swapHorizontalOutline,
  keyOutline,
  closeOutline,
  cardOutline,
  mailOutline,
  personOutline,
  briefcaseOutline,
  toggleOutline,
  checkmarkOutline,
  refreshOutline,
  searchOutline,
  peopleOutline,
  timeOutline,
  callOutline,
  trashOutline,
  eyeOutline
} from 'ionicons/icons';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario } from '../../../core/models/usuario.model';

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

  form: any = {
    id: null,
    cedula: '',
    nombre: '',
    email: '',
    rol: 'evaluador',
    password: '',
    activo: true,
    telefono: ''
  };

  constructor(private usuarioService: UsuarioService) {
    addIcons({
      addOutline,
      createOutline,
      swapHorizontalOutline,
      keyOutline,
      closeOutline,
      cardOutline,
      mailOutline,
      personOutline,
      briefcaseOutline,
      toggleOutline,
      checkmarkOutline,
      refreshOutline,
      searchOutline,
      peopleOutline,
      timeOutline,
      callOutline,
      trashOutline,
      eyeOutline
    });
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;

    this.usuarioService.listar().subscribe({
      next: (res: any) => {
        this.usuarios = res?.usuarios ?? res?.data ?? res ?? [];
        this.filtrarUsuarios();
        this.cargando = false;
      },
      error: () => {
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
      rol: 'evaluador',
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
      error: (err) => {
        this.guardando = false;
        console.error('Error guardando usuario:', err);
        alert('Error al guardar el usuario');
      }
    });
  }

  cambiarEstado(u: Usuario): void {
    this.usuarioService.cambiarEstado(u.id).subscribe({
      next: () => this.cargar(),
      error: (err: any) => {
        console.error('Error cambiando estado:', err);
        alert('Error al cambiar el estado');
      }
    });
  }

  resetPass(u: Usuario): void {
    if (confirm(`¿Resetear la contraseña de "${u.nombre}"?`)) {
      this.usuarioService.resetPassword(u.id).subscribe({
        next: () => {
          alert('Contraseña reseteada correctamente');
        },
        error: (err) => {
          console.error('Error resetando password:', err);
          alert('Error al resetear la contraseña');
        }
      });
    }
  }

  confirmarEliminar(u: Usuario): void {
    if (confirm(`¿Estás seguro de eliminar al usuario "${u.nombre}"?`)) {
      this.eliminarUsuario(u.id);
    }
  }

  eliminarUsuario(id: number): void {
    this.usuarioService.eliminar(id).subscribe({
      next: () => this.cargar(),
      error: (err) => {
        console.error('Error eliminando usuario:', err);
        alert('Error al eliminar el usuario');
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

  trackById(index: number, item: any): number {
    return item?.id ?? index;
  }
}
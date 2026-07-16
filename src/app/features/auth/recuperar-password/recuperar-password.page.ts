import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonContent, IonItem, IonInput, IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline,
  arrowBackOutline, checkmarkCircleOutline, alertCircleOutline,
  paperPlaneOutline, checkmarkOutline, informationCircleOutline
} from 'ionicons/icons';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonContent, IonItem, IonInput, IonButton, IonIcon, IonSpinner],
  templateUrl: './recuperar-password.page.html',
  styleUrls: ['./recuperar-password.page.scss']
})
export class RecuperarPasswordPage implements OnInit {

  // Determina qué formulario mostrar: si llega ?token=... en la URL
  // (desde el enlace del correo), mostramos "nueva contraseña";
  // si no, mostramos "ingresa tu correo" (el flujo normal desde login).
  modo: 'solicitar' | 'restablecer' = 'solicitar';
  token = '';

  // Formulario "solicitar"
  email = '';

  // Formulario "restablecer"
  nuevaPassword = '';
  confirmarPassword = '';
  mostrarPassword = false;

  cargando = signal(false);
  exito = signal(false);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    addIcons({
        mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline,
        arrowBackOutline, checkmarkCircleOutline, alertCircleOutline,
        paperPlaneOutline, checkmarkOutline, informationCircleOutline
    });
  }

  ngOnInit(): void {
    const tokenParam = this.route.snapshot.queryParamMap.get('token');
    if (tokenParam) {
      this.token = tokenParam;
      this.modo = 'restablecer';
    }
  }

  solicitarRecuperacion(): void {
    this.error.set(null);

    if (!this.email.trim()) {
      this.error.set('Ingresa tu correo institucional');
      return;
    }

    this.cargando.set(true);

    this.authService.solicitarRecuperacion(this.email.trim()).subscribe({
      next: () => {
        this.cargando.set(false);
        this.exito.set(true);
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(err.error?.mensaje || 'Error al procesar la solicitud');
      }
    });
  }

  restablecerPassword(): void {
    this.error.set(null);

    if (!this.nuevaPassword || this.nuevaPassword.length < 6) {
      this.error.set('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (this.nuevaPassword !== this.confirmarPassword) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    this.cargando.set(true);

    this.authService.resetearPassword(this.token, this.nuevaPassword).subscribe({
      next: () => {
        this.cargando.set(false);
        this.exito.set(true);
        setTimeout(() => this.router.navigate(['/login']), 2500);
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(err.error?.mensaje || 'Error al restablecer la contraseña');
      }
    });
  }
}
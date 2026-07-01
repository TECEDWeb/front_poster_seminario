import {
  Component,
  signal,
  OnInit,
  AfterViewInit,
  OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  IonSpinner
} from '@ionic/angular/standalone';

import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  personOutline,
  lockClosedOutline,
  logInOutline
} from 'ionicons/icons';

import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner
  ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, AfterViewInit, OnDestroy {

  cedula = '';
  password = '';
  mostrarPassword = false;

  cargando = signal(false);
  errorMensaje = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {

    console.log("======================================");
    console.log("🚀 LOGIN PAGE - INIT");
    console.log("URL:", window.location.href);
    console.log("======================================");

    addIcons({
      personOutline,
      lockClosedOutline,
      logInOutline
    });
  }

  ngOnInit(): void {
    console.log("✅ LoginPage ngOnInit");
  }

  ngAfterViewInit(): void {
    console.log("✅ LoginPage ngAfterViewInit");

    console.log("ion-content:", document.querySelector("ion-content"));
    console.log("ion-input:", document.querySelector("ion-input"));
  }

  ngOnDestroy(): void {
    console.log("❌ LoginPage destruida");
  }

  async onSubmit() {

    console.log("🚀 LOGIN INICIADO");

    if (!this.cedula || !this.password) {
      this.errorMensaje.set("Ingresa cédula y contraseña");
      return;
    }

    this.errorMensaje.set(null);
    this.cargando.set(true);

    console.log("📡 Enviando login...");

    this.authService.login({
      cedula: this.cedula.trim(),
      password: this.password
    }).subscribe({

      next: async (res) => {

        console.log("✅ LOGIN OK:", res);

        try {
          console.log("💾 Guardando sesión...");

          await this.authService.setSession(
            res.usuario,
            res.token
          );

          console.log("✅ Sesión guardada");

          const ruta = this.authService.rutaInicioSegunRol();

          console.log("➡️ Navegando a:", ruta);

          await this.router.navigateByUrl(ruta);

          console.log("✅ Navegación completada");

        } catch (e) {
          console.error("❌ ERROR guardando sesión", e);
        }

        this.cargando.set(false);
      },

      error: (err) => {

        console.error("❌ ERROR LOGIN:", err);

        this.errorMensaje.set(
          err?.error?.mensaje || "Error al iniciar sesión"
        );

        this.cargando.set(false);
      }

    });
  }
}
import { Component, signal, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
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
import { personOutline, lockClosedOutline, logInOutline, alertCircleOutline } from 'ionicons/icons';

import { AuthService } from 'src/app/core/services/auth.service';
import { LoginPayload, LoginResponse } from 'src/app/core/models/auth-reponse.model';

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
    console.log("LOGIN PAGE - INIT");
    console.log("URL:", window.location.href);
    console.log("======================================");

    addIcons({personOutline,lockClosedOutline,alertCircleOutline,logInOutline});
  }

  ngOnInit(): void {
    console.log("LoginPage ngOnInit");
    
    // Redirigir si ya está autenticado
    if (this.authService.isAuthenticated()) {
      const ruta = this.authService.rutaInicioSegunRol();
      this.router.navigate([ruta], { replaceUrl: true });
    }
  }

  ngAfterViewInit(): void {
    console.log("LoginPage ngAfterViewInit");
    console.log("ion-content:", document.querySelector("ion-content"));
    console.log("ion-input:", document.querySelector("ion-input"));
  }

  ngOnDestroy(): void {
    console.log("LoginPage destruida");
  }

  async onSubmit() {
    console.log("LOGIN INICIADO");

    // Validaciones
    if (!this.cedula || !this.password) {
      this.errorMensaje.set("Ingresa cédula y contraseña");
      return;
    }

    if (this.cedula.length < 10) {
      this.errorMensaje.set("La cédula debe tener al menos 10 dígitos");
      return;
    }

    if (this.password.length < 6) {
      this.errorMensaje.set("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    this.errorMensaje.set(null);
    this.cargando.set(true);

    const payload: LoginPayload = {
      cedula: this.cedula.trim(),
      password: this.password
    };

    this.authService.login(payload).subscribe({
      next: async (res: LoginResponse) => {
        console.log("============== LOGIN RESPONSE ==============");
        console.log(res);

        // Verificar que la respuesta sea exitosa
        if (res?.ok && res?.data?.token && res?.data?.usuario) {
          console.log("TOKEN:", res.data.token);
          console.log("USUARIO:", res.data.usuario);

          // Guardar sesión
          await this.authService.setSession(res.data.usuario, res.data.token);
          console.log("TOKEN EN AUTH:", this.authService.obtenerToken());

          const usuario = this.authService.obtenerUsuario();
          const ruta = this.authService.rutaInicioSegunRol();

          console.log("Navegando a:", ruta);

          // Redirigir
          await this.router.navigateByUrl(ruta, { replaceUrl: true });

          this.cargando.set(false);
        } else {
          console.error("❌ Respuesta de login inválida:", res);
          this.errorMensaje.set(res?.mensaje || "Error al iniciar sesión");
          this.cargando.set(false);
        }
      },
      error: (err) => {
        console.error("❌ ERROR LOGIN:", err);
        this.errorMensaje.set(err?.error?.mensaje || "Error al iniciar sesión. Verifica tus credenciales.");
        this.cargando.set(false);
      }
    });
  }
}
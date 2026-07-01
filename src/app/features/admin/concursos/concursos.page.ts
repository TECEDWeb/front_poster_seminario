import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ConcursoService } from '../../../core/services/concurso.service';
import { Concurso } from '../../../core/models/concurso.model';

@Component({
  selector: 'app-concursos',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './concursos.page.html',
  styleUrls: ['./concursos.page.scss']
})
export class ConcursosPage implements OnInit {

  // =========================
  // DATA
  // =========================
  concursos: Concurso[] = [];

  // =========================
  // UI STATE (FALTABA ESTO)
  // =========================
  cargando = false;

  constructor(private concursoService: ConcursoService) {}

  ngOnInit() {
    this.cargar();
  }

  // =========================
  // CARGAR CONCURSOS
  // =========================
  cargar() {
    this.cargando = true;

    this.concursoService.listar().subscribe({
      next: (res: any) => {

        // por seguridad soporta dos formatos
        this.concursos = res.concursos ?? res ?? [];

        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error cargando concursos:', err);
        this.concursos = [];
        this.cargando = false;
      }
    });
  }
}
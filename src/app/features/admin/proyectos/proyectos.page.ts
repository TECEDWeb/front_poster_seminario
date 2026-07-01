import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { ProyectoService } from '../../../core/services/proyecto.service';
import { Proyecto } from '../../../core/models/proyecto.model';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ],
  templateUrl: './proyectos.page.html',
  styleUrls: ['./proyectos.page.scss']
})
export class ProyectosPage implements OnInit {

  // =========================
  // DATA
  // =========================
  proyectos: Proyecto[] = [];

  // =========================
  // SEARCH (FALTABA ESTO)
  // =========================
  busqueda: string = '';

  constructor(private proyectoService: ProyectoService) {}

  ngOnInit() {
    this.cargar();
  }

  // =========================
  // CARGAR
  // =========================
  cargar() {
    this.proyectoService.listar().subscribe({
      next: (res: any) => {
        console.log('PROYECTOS:', res);
        this.proyectos = res.proyectos ?? res ?? [];
      },
      error: (err) => {
        console.error(err);
        this.proyectos = [];
      }
    });
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { FooterComponent } from 'src/app/shared/components/footer/footer.component';
import { ProyectoService } from '../../../core/services/proyecto.service';
import { Proyecto } from '../../../core/models/proyecto.model';
import { Router } from '@angular/router';


@Component({
  selector: 'app-proyectos-asignados',
  standalone: true,
  imports: [CommonModule, IonicModule, HeaderComponent, FooterComponent],
  templateUrl: './proyectos-asignados.page.html',
  styleUrls: ['./proyectos-asignados.page.scss']
})
export class ProyectosAsignadosPage implements OnInit {

  proyectos: Proyecto[] = [];

  constructor(
    private proyectoService: ProyectoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.proyectoService.listar().subscribe(res => {
      this.proyectos = res;
    });
  }

  evaluar(id: number) {
    this.router.navigate([
      '/evaluador/formulario-evaluacion',
      id
    ]);
  }

}
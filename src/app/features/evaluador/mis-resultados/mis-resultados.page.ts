import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { FooterComponent } from 'src/app/shared/components/footer/footer.component';
import { EvaluacionService } from '../../../core/services/evaluacion.service';
import { ResumenEvaluacion } from '../../../core/models/evaluacion.model';

@Component({
  selector: 'app-mis-resultados',
  standalone: true,
  imports: [CommonModule, IonicModule, HeaderComponent, FooterComponent],
  templateUrl: './mis-resultados.page.html',
  styleUrls: ['./mis-resultados.page.scss']
})
export class MisResultadosPage implements OnInit {

  evaluaciones: ResumenEvaluacion[] = [];
  loading = false;

  constructor(private evaluacionService: EvaluacionService) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.loading = true;

    this.evaluacionService.listarResumen().subscribe({
      next: (res: ResumenEvaluacion[]) => {
        this.evaluaciones = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar evaluaciones', err);
        this.loading = false;
      }
    });
  }
}
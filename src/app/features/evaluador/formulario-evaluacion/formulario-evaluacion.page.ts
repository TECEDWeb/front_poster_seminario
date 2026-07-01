import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { FooterComponent } from 'src/app/shared/components/footer/footer.component';
@Component({
  selector: 'app-formulario-evaluacion',
  standalone: true,
  imports: [CommonModule, IonicModule, HeaderComponent, FooterComponent],
  templateUrl: './formulario-evaluacion.page.html',
  styleUrls: ['./formulario-evaluacion.page.scss']
})
export class FormularioEvaluacionPage {

  proyectoId!: number;

  constructor(private route: ActivatedRoute) {
    this.proyectoId = Number(
      this.route.snapshot.paramMap.get('id')
    );
  }

}
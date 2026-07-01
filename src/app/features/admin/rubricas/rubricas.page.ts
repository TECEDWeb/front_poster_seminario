import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { FooterComponent } from 'src/app/shared/components/footer/footer.component';
import { RubricaService } from '../../../core/services/rubrica.service';
import { RubricaConcurso } from 'src/app/core/models/rubrica.model'; 
@Component({
  selector: 'app-rubricas',
  standalone: true,
  imports: [CommonModule, IonicModule, HeaderComponent, FooterComponent],
  templateUrl: './rubricas.page.html',
  styleUrls: ['./rubricas.page.scss']
})
export class RubricasPage implements OnInit {

  rubricas: RubricaConcurso[] = [];

  constructor(private rubricaService: RubricaService) {}

  ngOnInit() {
    this.rubricaService.listar().subscribe(res => {
      this.rubricas = res;
    });
  }

}
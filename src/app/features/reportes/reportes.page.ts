import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ReporteService } from 'src/app/core/services/reporte.service';
import { Reporte } from 'src/app/core/models/reporte.model'; 

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss']
})
export class ReportesPage implements OnInit {

  reportes: Reporte[] = [];

  constructor(private reporteService: ReporteService) {}

  ngOnInit() {
  
  }

}
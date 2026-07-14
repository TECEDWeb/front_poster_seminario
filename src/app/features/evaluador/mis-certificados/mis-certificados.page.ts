// src/app/features/evaluador/mis-certificados/mis-certificados.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-mis-certificados',
  templateUrl: './mis-certificados.page.html',
  styleUrls: ['./mis-certificados.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class MisCertificadosPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
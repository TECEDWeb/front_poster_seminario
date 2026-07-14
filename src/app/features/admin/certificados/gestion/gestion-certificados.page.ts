import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-gestion-certificados',
  templateUrl: './gestion-certificados.page.html',
  styleUrls: ['./gestion-certificados.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class GestionCertificadosPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
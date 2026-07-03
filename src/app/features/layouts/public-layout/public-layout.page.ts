import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './public-layout.page.html',
  styleUrls: ['./public-layout.page.scss']
})
export class PublicLayoutPage {

  constructor() {
    console.log('PublicLayout cargado');
  }
}
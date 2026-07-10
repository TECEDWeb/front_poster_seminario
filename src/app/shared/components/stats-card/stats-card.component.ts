import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonCardContent,
  IonIcon
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonCardContent,
    IonIcon
  ],
  templateUrl: './stats-card.component.html',
  styleUrls: ['./stats-card.component.scss']
})
export class StatsCardComponent {

  @Input() titulo = '';
  @Input() valor: number | string = '';
  @Input() icono = 'stats-chart';
  @Input() color: string = 'indigo';
  @Input() trend?: number | null;

}
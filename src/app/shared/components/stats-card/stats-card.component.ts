  import { Component, Input } from '@angular/core';
  import { IonicModule } from '@ionic/angular';
  import { CommonModule } from '@angular/common';

  @Component({
    selector: 'app-stats-card',
    standalone:true,
    imports:[
      IonicModule,
      CommonModule
    ],
    templateUrl:'./stats-card.component.html',
    styleUrls:['./stats-card.component.scss']
  })
  export class StatsCardComponent{
    @Input() titulo='';
    @Input() valor:number|string='';
    @Input() icono='stats-chart';

  }
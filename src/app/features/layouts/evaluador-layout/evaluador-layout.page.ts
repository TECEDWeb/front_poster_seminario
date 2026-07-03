import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-evaluador-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonApp,
    IonRouterOutlet,
    SidebarComponent
  ],
  templateUrl: './evaluador-layout.page.html',
  styleUrls: ['./evaluador-layout.page.scss']
})
export class EvaluadorLayoutPage {}
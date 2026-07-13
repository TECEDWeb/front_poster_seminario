import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonRouterOutlet, IonApp, IonContent } from '@ionic/angular/standalone';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-evaluador-layout',
  standalone: true,
  imports: [IonContent, IonApp, 
    CommonModule,
    RouterModule,
    IonRouterOutlet,
    SidebarComponent
  ],
  templateUrl: './evaluador-layout.page.html',
  styleUrls: ['./evaluador-layout.page.scss']
})
export class EvaluadorLayoutPage {}
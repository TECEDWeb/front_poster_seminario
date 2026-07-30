import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-coordinador-layout',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, SidebarComponent],
  templateUrl: './coordinador-layout.page.html',
  styleUrls: ['./coordinador-layout.page.scss']
})
export class CoordinadorLayoutPage {}
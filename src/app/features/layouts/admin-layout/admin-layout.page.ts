import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [IonicModule, SidebarComponent],
  templateUrl: './admin-layout.page.html',
})
export class AdminLayoutPage {}
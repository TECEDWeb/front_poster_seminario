import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  obtenerResumenAdmin() {
    console.log('LLAMANDO DASHBOARD ADMIN');
    return this.http.get<any>(`${this.apiUrl}/admin`);
  }
}
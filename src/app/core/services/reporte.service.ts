import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Reporte, ReporteStats, Ranking } from '../models/reporte.model';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {

  private apiUrl = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<ReporteStats> {
    return this.http.get<ReporteStats>(`${this.apiUrl}/stats`);
  }

  getRanking(): Observable<Ranking[]> {
    return this.http.get<any>(`${this.apiUrl}/ranking`);
  }

  getReportes(): Observable<Reporte[]> {
  return this.http.get<Reporte[]>(`${this.apiUrl}`);
}
}
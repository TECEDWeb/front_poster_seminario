import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Certificado } from '../models/certificado.model';

@Injectable({
  providedIn: 'root'
})
export class CertificadoService {

  private apiUrl = `${environment.apiUrl}/certificados`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Certificado[]> {
    return this.http.get<Certificado[]>(this.apiUrl);
  }

  obtener(id: number): Observable<Certificado> {
    return this.http.get<Certificado>(`${this.apiUrl}/${id}`);
  }

  generar(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/generar`, data);
  }

  validar(codigo: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/validar/${codigo}`);
  }

}
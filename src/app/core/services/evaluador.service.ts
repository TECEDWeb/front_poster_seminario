import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EvaluadorService {

  private apiUrl = `${environment.apiUrl}/asignaciones/evaluadores`;

  constructor(private http: HttpClient) {}

  listar(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  obtener(id:number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AsignacionService {

  private apiUrl = `${environment.apiUrl}/asignaciones`;

  constructor(private http: HttpClient) {}

  listar(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  asignar(data:any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

}
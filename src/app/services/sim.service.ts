import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Sim } from '../interceptors/models/sim.model';

@Injectable({
  providedIn: 'root'
})
export class SimService {

  private apiUrl = 'http://localhost:3000/api/sims';
  private baseUrl = 'http://localhost:3000/api'; 

  constructor(private http: HttpClient) {}

  getSims(): Observable<Sim[]> {
    return this.http.get<Sim[]>(this.apiUrl);
  }

  deleteSim(id: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getSimById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  updateSim(id: any, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  getHistorial(id: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/historial`);
  }

  importarExcel(formData: FormData): Observable<any> {
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/importar`, formData, { headers });
  }

  descargarReporteExcel(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/reportes/excel-general`, {
      responseType: 'blob' 
    });
  }
}
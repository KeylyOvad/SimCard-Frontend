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

  // --- Métodos CRUD para Sims ---

  getSims(): Observable<Sim[]> {
    return this.http.get<Sim[]>(this.apiUrl);
  }

  getSimById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createSim(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateSim(id: any, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteSim(id: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getHistorial(id: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/historial`);
  }

  // --- Métodos para Selects (Auxiliares) ---

  getOperadores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/operadores`);
  }

  getPlanes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/planes`);
  }

  getCapacidades(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/capacidad`);
  }

  getEstados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/estados`);
  }

  getTiposSim(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tiposim`);
  }

  getResponsables(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/responsables`);
  }

  getUbicaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/ubicaciones`);
  }

  getDestinos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/destinos`);
  }

  // --- Importación y Reportes ---

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
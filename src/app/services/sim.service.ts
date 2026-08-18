import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Sim } from '../interceptors/models/sim.model';
import { enviroment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SimService {

  // Rutas base para las peticiones API
  private apiUrl = `${enviroment.api}/sims`;
  private baseUrl = enviroment.api;

  constructor(private http: HttpClient) {}

  // Operaciones CRUD para SIM

  // Obtener todas las SIMs
  getSims(): Observable<Sim[]> {
    return this.http.get<Sim[]>(this.apiUrl);
  }

  // Obtener una SIM por su ID
  getSimById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Registrar una nueva SIM
  createSim(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // Actualizar datos de una SIM
  updateSim(id: any, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  // Eliminar una SIM
  deleteSim(id: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Obtener el historial de cambios de una SIM
  getHistorial(id: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/historial`);
  }

  // Listas auxiliares

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

  // Carga masiva

  importarExcel(formData: FormData): Observable<any> {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post(
      `${this.apiUrl}/importar`,
      formData,
      { headers }
    );
  }

  // Reportes

  descargarReporteExcel(): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/reportes/excel-general`,
      {
        responseType: 'blob'
      }
    );
  }
}